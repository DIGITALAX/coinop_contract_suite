import { ethers } from "hardhat";
import { BigNumber, Contract } from "ethers";
import chai from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
const { expect } = chai;

xdescribe("Escrow Contract", function () {
  let admin: SignerWithAddress,
    nonAdmin: SignerWithAddress,
    fulfiller: SignerWithAddress,
    childFGO: Contract,
    parentFGO: Contract,
    accessControl: Contract,
    coinOpFulfillment: Contract,
    coinOpFGOEscrow: Contract;

  beforeEach(async () => {
    [admin, nonAdmin, fulfiller] = await ethers.getSigners();

    const CoinOpAccessControl = await ethers.getContractFactory(
      "CoinOpAccessControl"
    );
    const CoinOpFulfillment = await ethers.getContractFactory(
      "CoinOpFulfillment"
    );
    const ChildFGO = await ethers.getContractFactory("CoinOpChildFGO");
    const ParentFGO = await ethers.getContractFactory("CoinOpParentFGO");
    const CoinOpFGOEscrow = await ethers.getContractFactory("CoinOpFGOEscrow");
    accessControl = await CoinOpAccessControl.deploy(
      "CoinOpAccessControl",
      "COAC"
    );
    coinOpFulfillment = await CoinOpFulfillment.deploy(
      accessControl.address,
      "CoinOpFulfillment",
      "COFU"
    );
    childFGO = await ChildFGO.deploy(
      "CoinOpChildFGO",
      "COCFGO",
      accessControl.address
    );

    parentFGO = await ParentFGO.deploy(
      childFGO.address,
      coinOpFulfillment.address,
      accessControl.address
    );

    coinOpFGOEscrow = await CoinOpFGOEscrow.deploy(
      parentFGO.address,
      childFGO.address,
      accessControl.address,
      "COEFGO",
      "CoinOpFGOEscrow"
    );

    await parentFGO.setFGOEscrow(coinOpFGOEscrow.address);
    await childFGO.setFGOEscrow(coinOpFGOEscrow.address);
    await childFGO.setParentFGO(parentFGO.address);
    await coinOpFulfillment.createFulfiller(10, fulfiller.address);
  });

  describe("Receives parent and child", () => {
    beforeEach(async () => {
      await parentFGO.mintFGO(
        "parentURI",
        "hoodie",
        ["childuri1", "childuri2", "childuri3"],
        "100000000000000000000",
        [
          "20000000000000000000",
          "30000000000000000000",
          "50000000000000000000",
        ],
        1
      );
    });
    it("updates deposit of parent", async () => {
      expect(await coinOpFGOEscrow.getParentDeposited(1)).to.be.true;
      expect(await coinOpFGOEscrow.getParentDeposited(2)).to.be.false;
    });
    it("updates deposit of child", async () => {
      expect(await coinOpFGOEscrow.getChildDeposited(1)).to.be.true;
      expect(await coinOpFGOEscrow.getChildDeposited(2)).to.be.true;
      expect(await coinOpFGOEscrow.getChildDeposited(3)).to.be.true;
      expect(await coinOpFGOEscrow.getChildDeposited(4)).to.be.false;
    });
    it("only depositor can deposit parent and child", async () => {
        try {
            await coinOpFGOEscrow.connect(nonAdmin).depositParent(1);
          } catch (err: any) {
            expect(err.message).to.include(
              "CoinOpFGOEscrow: Only a verified depositer contract can call this function"
            );
          }
      try {
        await coinOpFGOEscrow.connect(nonAdmin).depositChild(1);
      } catch (err: any) {
        expect(err.message).to.include(
          "CoinOpFGOEscrow: Only a verified depositer contract can call this function"
        );
      }
      try {
        await coinOpFGOEscrow.connect(nonAdmin).depositChild(2);
      } catch (err: any) {
        expect(err.message).to.include(
          "CoinOpFGOEscrow: Only a verified depositer contract can call this function"
        );
      }
      try {
        await coinOpFGOEscrow.connect(nonAdmin).depositChild(3);
      } catch (err: any) {
        expect(err.message).to.include(
          "CoinOpFGOEscrow: Only a verified depositer contract can call this function"
        );
      }
    });
  });

  describe("Releases parent and child", () => {
    beforeEach(async () => {
      await parentFGO.mintFGO(
        "parentURI",
        "hoodie",
        ["childuri1", "childuri2", "childuri3"],
        "100000000000000000000",
        [
          "20000000000000000000",
          "30000000000000000000",
          "50000000000000000000",
        ],
        1
      );
    });
    it("releases parent", async () => {
      await coinOpFGOEscrow.releaseParent(1);
      expect(await coinOpFGOEscrow.getParentDeposited(1)).to.be.false;
    });
    it("releases child", async () => {
      await coinOpFGOEscrow.releaseChildren([1]);
      expect(await coinOpFGOEscrow.getChildDeposited(1)).to.be.false;
      expect(await coinOpFGOEscrow.getChildDeposited(2)).to.be.true;
      expect(await coinOpFGOEscrow.getChildDeposited(3)).to.be.true;
    });
    it("only admin can release parent and child", async () => {
      try {
        await coinOpFGOEscrow.connect(nonAdmin).releaseParent(1);
      } catch (err: any) {
        expect(err.message).to.include(
          "CoinOpAccessControl: Only admin can perform this action"
        );
      }

      try {
        await coinOpFGOEscrow.connect(nonAdmin).releaseChildren([1]);
      } catch (err: any) {
        expect(err.message).to.include(
          "CoinOpAccessControl: Only admin can perform this action"
        );
      }
    });
    it("emits event on release of parent", async () => {
      const tx = await coinOpFGOEscrow.releaseParent(1);
      const receipt = await tx.wait();
      const event = receipt.events.find(
        (event: any) => event.event === "ParentReleased"
      );
      const eventData = await event.args;
      expect(eventData.parentTokenId).to.deep.equal(BigNumber.from("1"));
    });
    it("emits event on release of child", async () => {
      const tx = await coinOpFGOEscrow.releaseChildren([1]);
      const receipt = await tx.wait();
      const event = receipt.events.find(
        (event: any) => event.event === "ChildrenReleased"
      );
      const eventData = await event.args;
      expect(eventData.childTokenIds).to.deep.equal([BigNumber.from("1")]);
    });
  });

  describe("updates contracts", () => {
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
    it("updates access control", async () => {
      await coinOpFGOEscrow.updateAccessControl(newAccessControl.address);
      expect(await coinOpFGOEscrow.getAccessControlAddress()).to.equal(
        newAccessControl.address
      );
    });
    it("only admin can update", async () => {
      try {
        await coinOpFGOEscrow
          .connect(nonAdmin)
          .updateAccessControl(newAccessControl.address);
      } catch (err: any) {
        expect(err.message).to.include(
          "CoinOpAccessControl: Only admin can perform this action"
        );
      }
    });
    it("emits events on update", async () => {
      const tx = await coinOpFGOEscrow.updateAccessControl(
        newAccessControl.address
      );
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
