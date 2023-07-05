import { ethers } from "hardhat";
import { BigNumber, Contract } from "ethers";
import chai from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
const { expect } = chai;

xdescribe("Fulfiller Contract", function () {
  let admin: SignerWithAddress,
    nonAdmin: SignerWithAddress,
    fulfiller: SignerWithAddress,
    secondFulfiller: SignerWithAddress,
    thirdFulfiller: SignerWithAddress,
    accessControl: Contract,
    coinOpFulfillment: Contract;

  beforeEach(async () => {
    [admin, nonAdmin, fulfiller, secondFulfiller, thirdFulfiller] =
      await ethers.getSigners();

    const CoinOpAccessControl = await ethers.getContractFactory(
      "CoinOpAccessControl"
    );
    const CoinOpFulfillment = await ethers.getContractFactory(
      "CoinOpFulfillment"
    );

    accessControl = await CoinOpAccessControl.deploy(
      "CoinOpAccessControl",
      "COAC"
    );
    coinOpFulfillment = await CoinOpFulfillment.deploy(
      accessControl.address,
      "CoinOpFulfillment",
      "COFU"
    );
    await coinOpFulfillment.createFulfiller(10, fulfiller.address);
  });

  describe("Create fulfiller", async () => {
    beforeEach(async () => {
      await coinOpFulfillment.createFulfiller(30, secondFulfiller.address);
    });
    it("correctly sets the fulfiller information", async () => {
      expect(await coinOpFulfillment.getFulfillerAddress(1)).to.equal(
        fulfiller.address
      );
      expect(await coinOpFulfillment.getFulfillerAddress(2)).to.equal(
        secondFulfiller.address
      );
      expect(await coinOpFulfillment.getFulfillerPercent(1)).to.deep.equal(
        BigNumber.from("10")
      );
      expect(await coinOpFulfillment.getFulfillerPercent(2)).to.deep.equal(
        BigNumber.from("30")
      );
      expect(await coinOpFulfillment.getFulfillerCount()).to.deep.equal(
        BigNumber.from("2")
      );
    });

    it("only admin can add fulfiller", async () => {
      try {
        await coinOpFulfillment
          .connect(nonAdmin)
          .createFulfiller(20, nonAdmin.address);
      } catch (err: any) {
        expect(err.message).to.include(
          "CoinOpAccessControl: Only admin can perform this action"
        );
      }
    });
  });

  describe("remove a fulfiller", () => {
    beforeEach(async () => {
      await coinOpFulfillment.createFulfiller(30, secondFulfiller.address);
      await coinOpFulfillment.removeFulfiller(2);
    });

    it("fulfiller is removed", async () => {
      expect(await coinOpFulfillment.getFulfillerAddress(2)).to.equal(
        "0x0000000000000000000000000000000000000000"
      );
      expect(await coinOpFulfillment.getFulfillerPercent(2)).to.deep.equal(
        BigNumber.from("0")
      );
      expect(await coinOpFulfillment.getFulfillerCount()).to.deep.equal(
        BigNumber.from("1")
      );
    });
    it("only admin can remove", async () => {
      try {
        await coinOpFulfillment.connect(nonAdmin).removeFulfiller(1);
      } catch (err: any) {
        expect(err.message).to.include(
          "CoinOpAccessControl: Only admin can perform this action"
        );
      }
    });
    it("successfully add another fulfiller after", async () => {
      await coinOpFulfillment.createFulfiller(10, secondFulfiller.address);
      expect(await coinOpFulfillment.getFulfillerCount()).to.deep.equal(
        BigNumber.from("2")
      );
    });
  });

  describe("update fulfiller information", () => {
    it("updates fulfiller address", async () => {
      await coinOpFulfillment
        .connect(fulfiller)
        .updateFulfillerAddress(1, thirdFulfiller.address);
      expect(await coinOpFulfillment.getFulfillerAddress(1)).to.equal(
        thirdFulfiller.address
      );
    });
    it("updates fulfiller percent", async () => {
      await coinOpFulfillment.connect(fulfiller).updateFulfillerPercent(1, 80);
      expect(await coinOpFulfillment.getFulfillerPercent(1)).to.deep.equal(
        BigNumber.from("80")
      );
    });
    it("only the fulfiller can update their details", async () => {
      try {
        await coinOpFulfillment
          .connect(secondFulfiller)
          .updateFulfillerPercent(1, 80);
      } catch (err: any) {
        expect(err.message).to.include(
          "CoinOpFulfillment: Only the fulfiller can update."
        );
      }

      try {
        await coinOpFulfillment
          .connect(admin)
          .updateFulfillerAddress(1, nonAdmin.address);
      } catch (err: any) {
        expect(err.message).to.include(
          "CoinOpFulfillment: Only the fulfiller can update."
        );
      }
    });
  });

  describe("update contracts correctly", () => {
    let newAccessControl: Contract;
    beforeEach(async () => {
      const CoinOpAccessControl = await ethers.getContractFactory(
        "CoinOpAccessControl"
      );

      newAccessControl = await CoinOpAccessControl.deploy(
        "CoinOpAccessControl",
        "COAC"
      );
    });
    it("updates the address of access controls", async () => {
      await coinOpFulfillment.updateAccessControl(newAccessControl.address);
      expect(await coinOpFulfillment.getAccessControlContract()).to.equal(
        newAccessControl.address
      );
    });
    it("only the admin can update the access control", async () => {
      try {
        await coinOpFulfillment
          .connect(secondFulfiller)
          .updateAccessControl(newAccessControl.address);
      } catch (err: any) {
        expect(err.message).to.include(
          "CoinOpAccessControl: Only admin can perform this action"
        );
      }
    });
  });

  describe("emit events correctly", () => {
    it("emits access control updated", async () => {
      const CoinOpAccessControl = await ethers.getContractFactory(
        "CoinOpAccessControl"
      );

      const newAccessControl = await CoinOpAccessControl.deploy(
        "CoinOpAccessControl",
        "COAC"
      );
      const oldAccessControl =
        await coinOpFulfillment.getAccessControlContract();
      const tx = await coinOpFulfillment.updateAccessControl(
        newAccessControl.address
      );
      const receipt = await tx.wait();
      const event = receipt.events.find(
        (event: any) => event.event === "AccessControlUpdated"
      );
      const eventData = await event.args;
      expect(eventData.oldAccessControl).to.equal(oldAccessControl);
      expect(eventData.newAccessControl).to.equal(newAccessControl.address);
      expect(eventData.updater).to.equal(admin.address);
    });
    it("emits fulfiller created", async () => {
      const tx = await coinOpFulfillment.createFulfiller(10, fulfiller.address);
      const receipt = await tx.wait();
      const event = receipt.events.find(
        (event: any) => event.event === "FulfillerCreated"
      );
      const eventData = await event.args;
      expect(eventData.fulfillerId).to.deep.equal(BigNumber.from("2"));
      expect(eventData.fulfillerPercent).to.deep.equal(BigNumber.from("10"));
      expect(eventData.fulfillerAddress).to.equal(fulfiller.address);
    });
    it("emits fulfiller address updated", async () => {
      const tx = await coinOpFulfillment
        .connect(fulfiller)
        .updateFulfillerAddress(1, secondFulfiller.address);
      const receipt = await tx.wait();
      const event = receipt.events.find(
        (event: any) => event.event === "FulfillerAddressUpdated"
      );
      const eventData = await event.args;
      expect(eventData.fulfillerId).to.deep.equal(BigNumber.from("1"));
      expect(eventData.newFulfillerAddress).to.equal(secondFulfiller.address);
    });
    it("emits fulfiller percent updated", async () => {
      const tx = await coinOpFulfillment
        .connect(fulfiller)
        .updateFulfillerPercent(1, 20);
      const receipt = await tx.wait();
      const event = receipt.events.find(
        (event: any) => event.event === "FulfillerPercentUpdated"
      );
      const eventData = await event.args;
      expect(eventData.fulfillerId).to.deep.equal(BigNumber.from("1"));
      expect(eventData.newFulfillerPercent).to.deep.equal(BigNumber.from("20"));
    });
  });
});
