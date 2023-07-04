import { ethers } from "hardhat";
import { Contract } from "ethers";
import chai from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
const { expect } = chai;

describe("Payment Contract", function () {
  let admin: SignerWithAddress,
    nonAdmin: SignerWithAddress,
    accessControl: Contract,
    coinOpPayment: Contract,
    monaAddress: Contract,
    maticAddress: Contract,
    ethAddress: Contract,
    tetherAddress: Contract,
    tx: any;

  beforeEach(async () => {
    [admin, nonAdmin] = await ethers.getSigners();

    const CoinOpAccessControl = await ethers.getContractFactory(
      "CoinOpAccessControl"
    );
    const CoinOpPayment = await ethers.getContractFactory("CoinOpPayment");

    accessControl = await CoinOpAccessControl.deploy(
      "CoinOpAccessControl",
      "COAC"
    );
    coinOpPayment = await CoinOpPayment.deploy(
      accessControl.address,
      "CoinOpPayment",
      "COPA"
    );
  });

  describe("set payment tokens", () => {
    beforeEach(async () => {
      const ERC20 = await ethers.getContractFactory("TestToken");

      monaAddress = await ERC20.connect(admin).deploy();
      maticAddress = await ERC20.connect(admin).deploy();
      ethAddress = await ERC20.connect(admin).deploy();
      tetherAddress = await ERC20.connect(admin).deploy();
      tx = await coinOpPayment.setVerifiedPaymentTokens([
        monaAddress.address,
        maticAddress.address,
        ethAddress.address,
        tetherAddress.address,
      ]);
    });
    it("sets all payment tokens", async () => {
      expect(await coinOpPayment.checkIfAddressVerified(monaAddress.address)).to
        .be.true;
      expect(await coinOpPayment.checkIfAddressVerified(ethAddress.address)).to
        .be.true;
      expect(await coinOpPayment.checkIfAddressVerified(maticAddress.address))
        .to.be.true;
      expect(await coinOpPayment.checkIfAddressVerified(tetherAddress.address))
        .to.be.true;
      expect(await coinOpPayment.checkIfAddressVerified(nonAdmin.address)).to.be
        .false;

      expect(await coinOpPayment.getVerifiedPaymentTokens()).to.deep.equal([
        monaAddress.address,
        maticAddress.address,
        ethAddress.address,
        tetherAddress.address,
      ]);
    });
    it("only admin can set payment tokens", async () => {
      try {
        await coinOpPayment
          .connect(nonAdmin)
          .setVerifiedPaymentTokens([
            monaAddress.address,
            maticAddress.address,
            ethAddress.address,
            tetherAddress.address,
          ]);
      } catch (err: any) {
        expect(err.message).to.include(
          "CoinOpAccessControl: Only admin can perform this action"
        );
      }
    });

    it("emits updated tokens event", async () => {
      const receipt = await tx.wait();
      const event = receipt.events.find(
        (event: any) => event.event === "PaymentTokensUpdated"
      );
      const eventData = await event.args;
      expect(eventData.newPaymentTokens).to.deep.equal([
        monaAddress.address,
        maticAddress.address,
        ethAddress.address,
        tetherAddress.address,
      ]);
    });
  });

  describe("update access control", () => {
    let newAccessControl: Contract;
    beforeEach(async () => {
      const CoinOpAccessControl = await ethers.getContractFactory(
        "CoinOpAccessControl"
      );

      newAccessControl = await CoinOpAccessControl.deploy(
        "CoinOpAccessControl",
        "COAC"
      );

      tx = await coinOpPayment.updateAccessControl(newAccessControl.address);
    });

    it("correctly updates access control", async () => {
      expect(await coinOpPayment.getAccessControlContract()).to.equal(
        newAccessControl.address
      );
    });
    it("only admin can update access control", async () => {
      try {
        await coinOpPayment
          .connect(nonAdmin)
          .updateAccessControl(newAccessControl.address);
      } catch (err: any) {
        expect(err.message).to.include(
          "CoinOpAccessControl: Only admin can perform this action"
        );
      }
    });
    it("emits event on update", async () => {
      const receipt = await tx.wait();
      const event = receipt.events.find(
        (event: any) => event.event === "AccessControlUpdated"
      );
      const eventData = await event.args;
      expect(eventData.oldAccessControl).to.equal(accessControl.address);
      expect(eventData.newAccessControl).to.equal(newAccessControl.address);
      expect(eventData.updater).to.equal(admin.address);
    });
  });
});
