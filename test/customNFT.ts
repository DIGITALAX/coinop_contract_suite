import { ethers } from "hardhat";
import { BigNumber, Contract } from "ethers";
import chai from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
const { expect } = chai;

xdescribe("Custom Composite Contract", function () {
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

    preRollNFT = await PreRollNFT.deploy(
      accessControl.address,
      coinOpFulfillment.address
    );

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
      preRollNFT.address,
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
    await coinOpOracle.setOraclePricesUSD(
      "250000000000000000000",
      "1000000000000000000000",
      "1000000000000000000",
      "1000000000000000000"
    );
    await ethAddress.approve(
      coinOpMarket.address,
      BigNumber.from("6000000000000000000000000")
    );
    await parentFGO.setFGOEscrow(coinOpFGOEscrow.address);
    await childFGO.setFGOEscrow(coinOpFGOEscrow.address);
    await childFGO.setParentFGO(parentFGO.address);
    await coinOpFulfillment.createFulfiller(10, fulfiller.address);
    await parentFGO.mintFGO(
      "parentURI",
      "hoodie",
      ["childuri1", "childuri2", "childuri3"],
      "100000000000000000000",
      ["20000000000000000000", "30000000000000000000", "50000000000000000000"],
      1
    );
  });

  describe("mint batch", () => {
    beforeEach(async () => {
      await coinOpMarket.buyTokens({
        preRollIds: [],
        preRollAmounts: [],
        customIds: [1],
        customAmounts: [1],
        customURIs: ["customuri"],
        fulfillmentDetails: "fulfillmentdetails",
        chosenTokenAddress: ethAddress.address,
      });
    });
    it("token properties set correctly", async () => {
      expect(await customCompositeNFT.tokenURI(1)).to.equal("customuri");
      expect(await customCompositeNFT.getTokenCreator(1)).to.equal(
        admin.address
      );
      expect(await customCompositeNFT.getTokenAcceptedToken(1)).to.equal(
        ethAddress.address
      );
      expect(await customCompositeNFT.getTokenPrice(1)).to.deep.equal(
        BigNumber.from("120000000000000000")
      );
      expect(await customCompositeNFT.getTokenIsBurned(1)).to.be.false;
      expect(await customCompositeNFT.getTokenId(1)).to.deep.equal(
        BigNumber.from("1")
      );
      expect(await customCompositeNFT.getTokenFulfillerId(1)).to.deep.equal(
        BigNumber.from("1")
      );
    });
    it("token count updated", async () => {
      expect(await customCompositeNFT.getTotalSupplyCount()).to.deep.equal(
        BigNumber.from("1")
      );
    });
    it("only market can mint", async () => {
      try {
        customCompositeNFT.mint(
          ethAddress.address,
          nonAdmin.address,
          "20000000000",
          1,
          1,
          1,
          "customurihere"
        );
      } catch (err: any) {
        expect(err.message).to.include(
          "CustomCompositeNFT: Only Market contract can perform this action"
        );
      }
    });
    it("emits batch token minted event", async () => {
      const tx = await coinOpMarket.buyTokens({
        preRollIds: [],
        preRollAmounts: [],
        customIds: [1],
        customAmounts: [1],
        customURIs: ["customuri"],
        fulfillmentDetails: "fulfillmentdetails",
        chosenTokenAddress: ethAddress.address,
      });
      const receipt = await tx.wait();
      const event = receipt.events.find(
        (event: any) => event.event === "TokensBought"
      );
      const eventData = await event.args;
      expect(eventData.preRollIds).to.deep.equal([]);
      expect(eventData.preRollAmounts).to.deep.equal([]);
      expect(eventData.customIds).to.deep.equal([BigNumber.from("1")]);
      expect(eventData.customAmounts).to.deep.equal([BigNumber.from("1")]);
      expect(eventData.chosenTokenAddress).to.equal(ethAddress.address);
      expect(eventData.prices).to.deep.equal([
        BigNumber.from("120000000000000000"),
      ]);
      expect(eventData.buyer).to.equal(admin.address);
    });
  });

  describe("burn", () => {
    beforeEach(async () => {
      await ethAddress.transfer(nonAdmin.address, "330000000000000000");
      await ethAddress
        .connect(nonAdmin)
        .approve(
          coinOpMarket.address,
          BigNumber.from("6000000000000000000000000")
        );
      await coinOpMarket.connect(nonAdmin).buyTokens({
        preRollIds: [],
        preRollAmounts: [],
        customIds: [1],
        customAmounts: [2],
        customURIs: ["customuri"],
        fulfillmentDetails: "fulfillmentdetails",
        chosenTokenAddress: ethAddress.address,
      });
    });
    it("token burned", async () => {
      await customCompositeNFT.connect(nonAdmin).burn(1);
      expect(await customCompositeNFT.getTokenIsBurned(1)).to.be.true;
      expect(await customCompositeNFT.getTokenIsBurned(2)).to.be.false;
    });
    it("token batch burned", async () => {
      await customCompositeNFT.connect(nonAdmin).burnBatch([1, 2]);
      expect(await customCompositeNFT.getTokenIsBurned(1)).to.be.true;
      expect(await customCompositeNFT.getTokenIsBurned(2)).to.be.true;
    });
    it("only token owner can burn", async () => {
      try {
        await customCompositeNFT.connect(admin).burnBatch([1, 2]);
      } catch (err: any) {
        expect(err.message).to.include(
          "ERC721Metadata: Only token owner can burn token"
        );
      }
    });

    it("emits token burned event", async () => {
      await ethAddress.transfer(nonAdmin.address, "330000000000000000");
      await ethAddress
        .connect(nonAdmin)
        .approve(
          coinOpMarket.address,
          BigNumber.from("6000000000000000000000000")
        );
      await coinOpMarket.connect(nonAdmin).buyTokens({
        preRollIds: [],
        preRollAmounts: [],
        customIds: [1],
        customAmounts: [2],
        customURIs: ["customuri"],
        fulfillmentDetails: "fulfillmentdetails",
        chosenTokenAddress: ethAddress.address,
      });
      const tx = await customCompositeNFT.connect(nonAdmin).burn(3);
      const receipt = await tx.wait();
      const event = receipt.events.find(
        (event: any) => event.event === "TokenBurned"
      );
      const eventData = await event.args;
      expect(eventData.tokenId).to.deep.equal(BigNumber.from("3"));
    });

    it("mints again after burning", async () => {
      await ethAddress.transfer(nonAdmin.address, "330000000000000000");
      await ethAddress
        .connect(nonAdmin)
        .approve(
          coinOpMarket.address,
          BigNumber.from("6000000000000000000000000")
        );
      expect(await customCompositeNFT.getTotalSupplyCount()).to.deep.equal(
        BigNumber.from("2")
      );
      await customCompositeNFT.connect(nonAdmin).burn(1);
      await coinOpMarket.connect(nonAdmin).buyTokens({
        preRollIds: [],
        preRollAmounts: [],
        customIds: [1],
        customAmounts: [2],
        customURIs: ["customuri"],
        fulfillmentDetails: "fulfillmentdetails",
        chosenTokenAddress: ethAddress.address,
      });
      expect(await customCompositeNFT.getTotalSupplyCount()).to.deep.equal(
        BigNumber.from("4")
      );
    });
  });

  describe("updates all contracts", () => {
    let newAccessControl: Contract, newCoinOpMarket: Contract;
    beforeEach(async () => {
      const CoinOpMarket = await ethers.getContractFactory("CoinOpMarket");
      const CoinOpAccessControl = await ethers.getContractFactory(
        "CoinOpAccessControl"
      );
      newAccessControl = await CoinOpAccessControl.deploy(
        "CoinOpAccessControl",
        "COAC"
      );
      newCoinOpMarket = await CoinOpMarket.deploy(
        preRollCollection.address,
        accessControl.address,
        coinOpFulfillment.address,
        customCompositeNFT.address,
        childFGO.address,
        parentFGO.address,
        coinOpOracle.address,
        coinOpPayment.address,
        preRollNFT.address,
        "COMA",
        "CoinOpMarket"
      );
    });
    it("market updated", async () => {
      await customCompositeNFT.setCoinOpMarket(newCoinOpMarket.address);
      expect(await customCompositeNFT.getMarketContract()).to.equal(
        newCoinOpMarket.address
      );
    });
    it("emits market updated event", async () => {
      const tx = await customCompositeNFT.setCoinOpMarket(
        newCoinOpMarket.address
      );
      const receipt = await tx.wait();
      const event = receipt.events.find(
        (event: any) => event.event === "MarketUpdated"
      );
      const eventData = await event.args;
      expect(eventData.oldMarket).to.equal(coinOpMarket.address);
      expect(eventData.newMarket).to.equal(newCoinOpMarket.address);
      expect(eventData.updater).to.equal(admin.address);
    });
    it("access control updated", async () => {
      await customCompositeNFT.updateAccessControl(newAccessControl.address);
      expect(await customCompositeNFT.getAccessControlContract()).to.equal(
        newAccessControl.address
      );
    });
    it("emits access control updated event", async () => {
      const tx = await customCompositeNFT.updateAccessControl(
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
    it("only admin can updated", async () => {
      try {
        await customCompositeNFT
          .connect(nonAdmin)
          .updateAccessControl(newAccessControl.address);
      } catch (err: any) {
        expect(err.message).to.include(
          "CoinOpAccessControl: Only admin can perform this action"
        );
      }
      try {
        await customCompositeNFT
          .connect(nonAdmin)
          .setCoinOpMarket(newCoinOpMarket.address);
      } catch (err: any) {
        expect(err.message).to.include(
          "CoinOpAccessControl: Only admin can perform this action"
        );
      }
    });
  });
});
