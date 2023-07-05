import { ethers } from "hardhat";
import { BigNumber, Contract } from "ethers";
import chai from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
const { expect } = chai;

xdescribe("PreRoll Contracts", function () {
  let admin: SignerWithAddress,
    nonAdmin: SignerWithAddress,
    fulfiller: SignerWithAddress,
    childFGO: Contract,
    parentFGO: Contract,
    accessControl: Contract,
    coinOpFulfillment: Contract,
    coinOpMarket: Contract,
    coinOpFGOEscrow: Contract,
    coinOpOracle: Contract,
    preRollCollection: Contract,
    preRollNFT: Contract,
    coinOpPayment: Contract,
    monaAddress: Contract,
    maticAddress: Contract,
    ethAddress: Contract,
    tetherAddress: Contract,
    customCompositeNFT: Contract;

  beforeEach(async () => {
    [admin, nonAdmin, fulfiller] = await ethers.getSigners();

    const CoinOpAccessControl = await ethers.getContractFactory(
      "CoinOpAccessControl"
    );
    const CustomCompositeNFT = await ethers.getContractFactory(
      "CustomCompositeNFT"
    );
    const CoinOpFulfillment = await ethers.getContractFactory(
      "CoinOpFulfillment"
    );
    const CoinOpMarket = await ethers.getContractFactory("CoinOpMarket");
    const ChildFGO = await ethers.getContractFactory("CoinOpChildFGO");
    const ParentFGO = await ethers.getContractFactory("CoinOpParentFGO");
    const CoinOpFGOEscrow = await ethers.getContractFactory("CoinOpFGOEscrow");
    const PreRollNFT = await ethers.getContractFactory("PreRollNFT");
    const PreRollCollection = await ethers.getContractFactory(
      "PreRollCollection"
    );
    const CoinOpPayment = await ethers.getContractFactory("CoinOpPayment");
    const CoinOpOracle = await ethers.getContractFactory("CoinOpOracle");

    accessControl = await CoinOpAccessControl.deploy(
      "CoinOpAccessControl",
      "COAC"
    );
    coinOpPayment = await CoinOpPayment.deploy(
      accessControl.address,
      "CoinOpPayment",
      "COPA"
    );
    customCompositeNFT = await CustomCompositeNFT.deploy(accessControl.address);
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

    const ERC20 = await ethers.getContractFactory("TestToken");

    monaAddress = await ERC20.connect(admin).deploy();
    maticAddress = await ERC20.connect(admin).deploy();
    ethAddress = await ERC20.connect(admin).deploy();
    tetherAddress = await ERC20.connect(admin).deploy();

    coinOpOracle = await CoinOpOracle.deploy(
      accessControl.address,
      monaAddress.address,
      ethAddress.address,
      maticAddress.address,
      tetherAddress.address,
      "COOR",
      "CoinOpOracle"
    );

    preRollNFT = await PreRollNFT.deploy(accessControl.address);

    preRollCollection = await PreRollCollection.deploy(
      preRollNFT.address,
      accessControl.address,
      coinOpPayment.address,
      "PRCOL",
      "PreRollCollection"
    );

    coinOpMarket = await CoinOpMarket.deploy(
      preRollCollection.address,
      accessControl.address,
      coinOpFulfillment.address,
      customCompositeNFT.address,
      childFGO.address,
      parentFGO.address,
      coinOpOracle.address,
      coinOpPayment.address,
      "COMA",
      "CoinOpMarket"
    );

    await coinOpPayment.setVerifiedPaymentTokens([
      monaAddress.address,
      maticAddress.address,
      ethAddress.address,
      tetherAddress.address,
    ]);
    await customCompositeNFT.setCoinOpMarket(coinOpMarket.address);
    await preRollCollection.setCoinOpMarket(coinOpMarket.address);
    await preRollCollection.setCoinOpFulfillment(coinOpFulfillment.address);
    await preRollNFT.setPreRollCollection(preRollCollection.address);
    await parentFGO.setFGOEscrow(coinOpFGOEscrow.address);
    await childFGO.setFGOEscrow(coinOpFGOEscrow.address);
    await childFGO.setParentFGO(parentFGO.address);
    await coinOpFulfillment.createFulfiller(10, fulfiller.address);
  });

  describe("collection", () => {
    it("collection properties set correctly", async () => {});
    it("collection count updated", async () => {});
    it("sets correct amount minted", async () => {});
    it("fulfiller address must be correct", async () => {});
    it("only admin or writer can mint", async () => {});
    it("emits collection created", async () => {});
  });

  describe("adds to existing collection", () => {
    it("correctly updates collection amount", async () => {});
    it("cannot exceed max", async () => {});
    it("only admin or writer can update", async () => {});
    it("only collection owner can add", async () => {});
    it("collection must exist", async () => {});
    it("can mint again after collection is added to", async () => {});
    it("emits collection added", async () => {});
  });

  describe("purchase and mint", async () => {
    it("successfully minted", async () => {});
    it("minted count updated", async () => {});
    it("only collection can mint nft contract", async () => {});
    it("can add to collection after purchase", async () => {});
    it("sets correct nft properties", async () => {});
    it("sets correct nft count updated", async () => {});
    it("emits tokens minted", async () => {});
  });

  describe("set collection", async () => {
    it("updates collection values", async () => {});
    it("old nft tokens keep old properties", async () => {});
    it("new nft tokens adopt new properties", async () => {});
    it("emits property events", async () => {});
  });

  describe("delete collection", () => {
    it("delete the collection", async () => {});
    it("reset collection amount", async () => {});
    it("can't mint or purchase or add after deleted", async () => {});
    it("emits collection deleted", async () => {});
  });

  describe("burn NFTs", async () => {
    it("only owner can burn", async () => {});
    it("only owner can burn batch", async () => {});
    it("emits burn events", async () => {});
  });

  describe("updates all contracts", () => {
    it("update access control nft", async () => {});
    it("update pre roll collection nft", async () => {});
    it("update market collection", async () => {});
    it("update payment collection", async () => {});
    it("update pre roll nft collection", async () => {});
    it("update fulfillment collection", async () => {});
    it("update access control collection", async () => {});
    it("emits contracts updated", async () => {});
    it("only admin can update", async () => {});
  });
});
