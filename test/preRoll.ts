import { ethers } from "hardhat";
import { BigNumber, Contract } from "ethers";
import chai from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
const { expect } = chai;

xdescribe("PreRoll Contracts", function () {
  let admin: SignerWithAddress,
    nonAdmin: SignerWithAddress,
    fulfiller: SignerWithAddress,
    creator: SignerWithAddress,
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
    [admin, nonAdmin, fulfiller, creator] = await ethers.getSigners();

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
    await accessControl.addWriter(creator.address);
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

  describe("collection", () => {
    beforeEach(async () => {
      await preRollCollection.createCollection(
        20,
        {
          price: "100000000000000000000",
          fulfillerId: 1,
          discount: 0,
          sizes: ["xs", "m", "l"],
          uri: "someuri",
          printType: "hoodie",
        },
        false
      );
    });
    it("collection properties set correctly", async () => {
      expect(await preRollCollection.getCollectionCreator(1)).to.equal(
        admin.address
      );
      expect(await preRollCollection.getCollectionURI(1)).to.equal("someuri");
      expect(await preRollCollection.getCollectionAmount(1)).to.deep.equal(
        BigNumber.from("20")
      );
      expect(await preRollCollection.getCollectionNoLimit(1)).to.be.false;
      expect(await preRollCollection.getCollectionPrice(1)).to.deep.equal(
        BigNumber.from("100000000000000000000")
      );
      expect(await preRollCollection.getCollectionIsDeleted(1)).to.be.false;
      expect(await preRollCollection.getCollectionFulfillerId(1)).to.deep.equal(
        BigNumber.from("1")
      );
      expect(await preRollCollection.getCollectionPrintType(1)).to.equal(
        "hoodie"
      );
      expect(await preRollCollection.getCollectionSizes(1)).to.deep.equal([
        "xs",
        "m",
        "l",
      ]);
      expect(await preRollCollection.getCollectionTokenIds(1)).to.deep.equal(
        []
      );
      expect(await preRollCollection.getCollectionDiscount(1)).to.deep.equal(
        BigNumber.from("0")
      );
      expect(
        await preRollCollection.getCollectionTokensMinted(1)
      ).to.deep.equal(BigNumber.from("0"));
      expect(
        await preRollCollection.getCollectionTokensMinted(1)
      ).to.deep.equal(BigNumber.from("0"));
    });
    it("collection count updated", async () => {
      expect(await preRollCollection.getCollectionSupply()).to.deep.equal(
        BigNumber.from("1")
      );
    });
    it("sets correct amount minted", async () => {
      await coinOpMarket.buyTokens({
        preRollIds: [1],
        preRollAmounts: [2],
        customIds: [],
        customAmounts: [],
        customURIs: [],
        fulfillmentDetails: "fulfillmentdetails",
        chosenTokenAddress: ethAddress.address,
      });
      expect(
        await preRollCollection.getCollectionTokensMinted(1)
      ).to.deep.equal(BigNumber.from("2"));

      expect(await preRollCollection.getCollectionTokenIds(1)).to.deep.equal([
        BigNumber.from("1"),
        BigNumber.from("2"),
      ]);
    });
    it("fulfiller address must be correct", async () => {
      try {
        await preRollCollection.createCollection(
          20,
          {
            price: "100000000000000000000",
            fulfillerId: 2,
            discount: 0,
            sizes: ["xs", "m", "l"],
            uri: "someuri",
            printType: "hoodie",
          },
          false
        );
      } catch (err: any) {
        expect(err.message).to.include(
          "CoinOpFulfillment: FulfillerId does not exist."
        );
      }
    });
    it("only admin or writer can create collection", async () => {
      try {
        await preRollCollection.connect(nonAdmin).createCollection(
          20,
          {
            price: "100000000000000000000",
            fulfillerId: 2,
            discount: 0,
            sizes: ["xs", "m", "l"],
            uri: "someuri",
            printType: "hoodie",
          },
          false
        );
      } catch (err: any) {
        expect(err.message).to.include(
          "PreRollCollection: Only admin or writer can perform this action"
        );
      }
    });
    it("emits collection created", async () => {
      const tx = await preRollCollection.createCollection(
        10,
        {
          price: "100000000000000000000",
          fulfillerId: 1,
          discount: 0,
          sizes: ["xs", "m", "l"],
          uri: "someuri",
          printType: "hoodie",
        },
        false
      );
      const receipt = await tx.wait();
      const event = receipt.events.find(
        (event: any) => event.event === "CollectionCreated"
      );
      const eventData = await event.args;
      expect(eventData.collectionId).to.deep.equal(BigNumber.from("2"));
      expect(eventData.uri).to.equal("someuri");
      expect(eventData.amount).to.deep.equal(BigNumber.from("10"));
      expect(eventData.owner).to.equal(admin.address);
    });
    it("correctly works with no limit", async () => {
      await preRollCollection.createCollection(
        0,
        {
          price: "100000000000000000000",
          fulfillerId: 1,
          discount: 0,
          sizes: ["xs", "m", "l"],
          uri: "someuri",
          printType: "hoodie",
        },
        true
      );
      await coinOpMarket.buyTokens({
        preRollIds: [2],
        preRollAmounts: [5],
        customIds: [],
        customAmounts: [],
        customURIs: [],
        fulfillmentDetails: "fulfillmentdetails",
        chosenTokenAddress: ethAddress.address,
      });
      expect(
        await preRollCollection.getCollectionTokensMinted(2)
      ).to.deep.equal(BigNumber.from("5"));
    });
    it("can't buy over the limit if it exists", async () => {
      try {
        await coinOpMarket.buyTokens({
          preRollIds: [1],
          preRollAmounts: [21],
          customIds: [],
          customAmounts: [],
          customURIs: [],
          fulfillmentDetails: "fulfillmentdetails",
          chosenTokenAddress: ethAddress.address,
        });
      } catch (err: any) {
        expect(err.message).to.include(
          "CoinOpMarket: No more tokens can be bought from this collection."
        );
      }
    });
  });

  describe("adds to existing collection", () => {
    beforeEach(async () => {
      await preRollCollection.createCollection(
        20,
        {
          price: "100000000000000000000",
          fulfillerId: 1,
          discount: 0,
          sizes: ["xs", "m", "l"],
          uri: "someuri",
          printType: "hoodie",
        },
        false
      );
      await preRollCollection.addToExistingCollection(1, 10);
    });
    it("correctly updates collection amount", async () => {
      expect(await preRollCollection.getCollectionAmount(1)).to.deep.equal(
        BigNumber.from("30")
      );
    });
    it("only admin or writer can update", async () => {
      try {
        await preRollCollection
          .connect(nonAdmin)
          .addToExistingCollection(1, 10);
      } catch (err: any) {
        expect(err.message).to.include(
          "PreRollCollection: Only admin or writer can perform this action"
        );
      }
    });
    it("only collection owner can add", async () => {
      try {
        await preRollCollection.connect(creator).createCollection(
          20,
          {
            price: "100000000000000000000",
            fulfillerId: 1,
            discount: 0,
            sizes: ["xs", "m", "l"],
            uri: "someuri",
            printType: "hoodie",
          },
          false
        );
        await preRollCollection.addToExistingCollection(2, 10);
      } catch (err: any) {
        expect(err.message).to.include(
          "PreRollCollection: Only the owner of a collection can add to it."
        );
      }
    });
    it("collection must exist and not be deleted", async () => {
      try {
        await preRollCollection.addToExistingCollection(10, 10);
      } catch (err: any) {
        expect(err.message).to.include(
          "PreRollCollection: Collection does not exist"
        );
      }
      try {
        await preRollCollection.deleteCollection(1);
        await preRollCollection.addToExistingCollection(1, 10);
      } catch (err: any) {
        expect(err.message).to.include(
          "PreRollCollection: This collection has been deleted"
        );
      }
    });
    it("can mint again after collection is added to", async () => {
      await coinOpMarket.buyTokens({
        preRollIds: [1],
        preRollAmounts: [2],
        customIds: [],
        customAmounts: [],
        customURIs: [],
        fulfillmentDetails: "fulfillmentdetails",
        chosenTokenAddress: ethAddress.address,
      });
      expect(
        await preRollCollection.getCollectionTokensMinted(1)
      ).to.deep.equal(BigNumber.from("2"));
    });
    it("emits collection added", async () => {
      const tx = await preRollCollection.addToExistingCollection(1, 4);
      const receipt = await tx.wait();
      const event = receipt.events.find(
        (event: any) => event.event === "CollectionAdded"
      );
      const eventData = await event.args;
      expect(eventData.collectionId).to.deep.equal(BigNumber.from("1"));
      expect(eventData.amount).to.deep.equal(BigNumber.from("4"));
      expect(eventData.owner).to.equal(admin.address);
    });
  });

  describe("purchase and mint", async () => {
    beforeEach(async () => {
      await preRollCollection.createCollection(
        100,
        {
          price: "100000000000000000000",
          fulfillerId: 1,
          discount: 0,
          sizes: ["xs", "m", "l"],
          uri: "someuri",
          printType: "hoodie",
        },
        false
      );
      await preRollCollection.createCollection(
        20,
        {
          price: "200000000000000000000",
          fulfillerId: 1,
          discount: 0,
          sizes: ["xs", "s"],
          uri: "someuri",
          printType: "sticker",
        },
        false
      );
      await coinOpMarket.buyTokens({
        preRollIds: [1, 2],
        preRollAmounts: [3, 2],
        customIds: [],
        customAmounts: [],
        customURIs: [],
        fulfillmentDetails: "fulfillmentdetails",
        chosenTokenAddress: ethAddress.address,
      });
    });
    it("successfully minted", async () => {
      expect(await preRollCollection.getCollectionTokenIds(1)).to.deep.equal([
        BigNumber.from("1"),
        BigNumber.from("2"),
        BigNumber.from("3"),
      ]);
      expect(
        await preRollCollection.getCollectionTokensMinted(1)
      ).to.deep.equal(BigNumber.from("3"));
      expect(await preRollCollection.getCollectionTokenIds(2)).to.deep.equal([
        BigNumber.from("4"),
        BigNumber.from("5"),
      ]);
      expect(
        await preRollCollection.getCollectionTokensMinted(2)
      ).to.deep.equal(BigNumber.from("2"));
    });
    it("minted count updated", async () => {
      expect(await preRollCollection.getCollectionSupply()).to.deep.equal(
        BigNumber.from("2")
      );
      expect(await preRollNFT.getTotalSupplyCount()).to.deep.equal(
        BigNumber.from("5")
      );
    });
    it("only collection can mint nft contract", async () => {
      try {
        await preRollNFT.mintBatch(
          {
            price: "100000",
            uri: "uri",
            printType: "shirt",
            fulfillerId: 1,
            discount: 20,
            sizes: ["s", "xs"],
          },
          1,
          1,
          admin.address,
          admin.address,
          ethAddress.address
        );
      } catch (err: any) {
        expect(err.message).to.include(
          "PreRollNFT: Only collection contract can mint tokens"
        );
      }
    });
    it("can add to collection after purchase", async () => {
      await preRollCollection.addToExistingCollection(1, 10);
      expect(await preRollCollection.getCollectionAmount(1)).to.deep.equal(
        BigNumber.from("110")
      );
    });
  });

  describe("set collection", async () => {
    beforeEach(async () => {
      await preRollCollection.connect(creator).createCollection(
        20,
        {
          price: "100000000000000000000",
          fulfillerId: 1,
          discount: 0,
          sizes: ["xs", "m", "l"],
          uri: "someuri",
          printType: "hoodie",
        },
        false
      );
    });
    it("updates collection values", async () => {
      await preRollCollection
        .connect(creator)
        .setCollectionPrintType("shirt", 1);
      expect(await preRollCollection.getCollectionPrintType(1)).to.equal(
        "shirt"
      );

      await preRollCollection
        .connect(creator)
        .setCollectionSizes(["l", "xl"], 1);
      expect(await preRollCollection.getCollectionSizes(1)).to.deep.equal([
        "l",
        "xl",
      ]);

      await coinOpFulfillment.createFulfiller(10, fulfiller.address);
      await preRollCollection.connect(creator).setCollectionFulfillerId(2, 1);
      expect(await preRollCollection.getCollectionFulfillerId(1)).to.deep.equal(
        BigNumber.from("2")
      );

      await preRollCollection.connect(creator).setCollectionURI("newuri", 1);
      expect(await preRollCollection.getCollectionURI(1)).to.equal("newuri");

      await preRollCollection.connect(creator).setCollectionDiscount(50, 1);
      expect(await preRollCollection.getCollectionDiscount(1)).to.deep.equal(
        BigNumber.from("50")
      );

      await preRollCollection
        .connect(creator)
        .setCollectionPrice(1, "50000000000");
      expect(await preRollCollection.getCollectionPrice(1)).to.deep.equal(
        BigNumber.from("50000000000")
      );
    });
    it("only creator can update collection values", async () => {
      try {
        await preRollCollection.setCollectionPrice(1, "50000000000");
      } catch (err: any) {
        expect(err.message).to.include(
          "PreRollCollection: Only the creator can edit this collection"
        );
      }

      try {
        await preRollCollection.setCollectionDiscount(50, 1);
      } catch (err: any) {
        expect(err.message).to.include(
          "PreRollCollection: Only the creator can edit this collection"
        );
      }

      try {
        await preRollCollection.setCollectionURI("newuri", 1);
      } catch (err: any) {
        expect(err.message).to.include(
          "PreRollCollection: Only the creator can edit this collection"
        );
      }

      try {
        await coinOpFulfillment.createFulfiller(10, fulfiller.address);
        await preRollCollection.setCollectionFulfillerId(2, 1);
      } catch (err: any) {
        expect(err.message).to.include(
          "PreRollCollection: Only the creator can edit this collection"
        );
      }
    });
    it("old nft tokens keep old properties and new nft tokens adopt new properties", async () => {
      await coinOpMarket.buyTokens({
        preRollIds: [1],
        preRollAmounts: [1],
        customIds: [],
        customAmounts: [],
        customURIs: [],
        fulfillmentDetails: "fulfillmentdetails",
        chosenTokenAddress: ethAddress.address,
      });

      await preRollCollection
        .connect(creator)
        .setCollectionPrintType("shirt", 1);
      await preRollCollection
        .connect(creator)
        .setCollectionSizes(["l", "xl"], 1);
      await coinOpFulfillment.createFulfiller(10, fulfiller.address);
      await preRollCollection.connect(creator).setCollectionFulfillerId(2, 1);
      await preRollCollection.connect(creator).setCollectionURI("newuri", 1);
      await preRollCollection.connect(creator).setCollectionDiscount(50, 1);
      await preRollCollection
        .connect(creator)
        .setCollectionPrice(1, "50000000000");

      expect(await preRollNFT.getTokenPrintType(1)).to.equal("hoodie");
      expect(await preRollNFT.getTokenSizes(1)).to.deep.equal(["xs", "m", "l"]);
      expect(await preRollNFT.getTokenFulfillerId(1)).to.deep.equal(
        BigNumber.from("1")
      );
      expect(await preRollNFT.tokenURI(1)).to.equal("someuri");
      expect(await preRollNFT.getTokenDiscount(1)).to.deep.equal(
        BigNumber.from("0")
      );
      expect(await preRollNFT.getTokenPrice(1)).to.deep.equal(
        BigNumber.from("100000000000000000000")
      );
    });
    it("only the creator can update fulfiller id", async () => {
      await coinOpFulfillment.createFulfiller(10, fulfiller.address);
      await coinOpMarket.buyTokens({
        preRollIds: [1],
        preRollAmounts: [1],
        customIds: [],
        customAmounts: [],
        customURIs: [],
        fulfillmentDetails: "fulfillmentdetails",
        chosenTokenAddress: ethAddress.address,
      });
      await preRollNFT.connect(creator).setFulfillerId(1, 2);
      expect(await preRollNFT.getTokenFulfillerId(1)).to.deep.equal(
        BigNumber.from("2")
      );
      try {
        await preRollNFT.setFulfillerId(1, 1);
      } catch (err: any) {
        expect(err.message).to.include(
          "PreRollNFT: Only the creator can edit the fulfiller ID"
        );
      }
    });
    it("new fulfiller id must be valid", async () => {
      try {
        await coinOpMarket.buyTokens({
          preRollIds: [1],
          preRollAmounts: [1],
          customIds: [],
          customAmounts: [],
          customURIs: [],
          fulfillmentDetails: "fulfillmentdetails",
          chosenTokenAddress: ethAddress.address,
        });
        await preRollNFT.connect(creator).setFulfillerId(1, 2);
      } catch (err: any) {
        expect(err.message).to.include(
          "CoinOpFulfillment: FulfillerId does not exist."
        );
      }
    });
    it("emits property events", async () => {
      await coinOpFulfillment.createFulfiller(10, fulfiller.address);
      await coinOpMarket.buyTokens({
        preRollIds: [1],
        preRollAmounts: [1],
        customIds: [],
        customAmounts: [],
        customURIs: [],
        fulfillmentDetails: "fulfillmentdetails",
        chosenTokenAddress: ethAddress.address,
      });
      const tx = await preRollNFT.connect(creator).setFulfillerId(1, 2);
      const receipt = await tx.wait();
      const event = receipt.events.find(
        (event: any) => event.event === "TokenFulfillerIdUpdated"
      );
      const eventData = await event.args;
      expect(eventData.tokenId).to.deep.equal(BigNumber.from("1"));
      expect(eventData.oldFulfillerId).to.deep.equal(BigNumber.from("1"));
      expect(eventData.newFulfillerId).to.deep.equal(BigNumber.from("2"));
      expect(eventData.updater).to.equal(creator.address);
    });
  });

  describe("delete collection", () => {
    beforeEach(async () => {
      await preRollCollection.connect(creator).createCollection(
        20,
        {
          price: "100000000000000000000",
          fulfillerId: 1,
          discount: 0,
          sizes: ["xs", "m", "l"],
          uri: "someuri",
          printType: "hoodie",
        },
        false
      );
      await coinOpMarket.buyTokens({
        preRollIds: [1],
        preRollAmounts: [2],
        customIds: [],
        customAmounts: [],
        customURIs: [],
        fulfillmentDetails: "fulfillmentdetails",
        chosenTokenAddress: ethAddress.address,
      });
    });
    it("delete the collection", async () => {
      await preRollCollection.connect(creator).deleteCollection(1);
      expect(await preRollCollection.getCollectionIsDeleted(1)).to.be.true;
    });
    it("reset collection amount", async () => {
      await preRollCollection.connect(creator).deleteCollection(1);
      expect(await preRollCollection.getCollectionAmount(1)).to.deep.equal(
        BigNumber.from("2")
      );
    });
    it("only the creator can delete", async () => {
      try {
        await preRollCollection.deleteCollection(1);
      } catch (err: any) {
        expect(err.message).to.include(
          "PreRollCollection: Only the creator can edit this collection"
        );
      }
    });
    it("can't mint or purchase or add after deleted", async () => {
      try {
        await preRollCollection.connect(creator).deleteCollection(1);
        await coinOpMarket.buyTokens({
          preRollIds: [1],
          preRollAmounts: [2],
          customIds: [],
          customAmounts: [],
          customURIs: [],
          fulfillmentDetails: "fulfillmentdetails",
          chosenTokenAddress: ethAddress.address,
        });
      } catch (err: any) {
        expect(err.message).to.include(
          "CoinOpMarket: No more tokens can be bought from this collection."
        );
      }

      try {
        await preRollCollection.connect(creator).addToExistingCollection(1, 10);
      } catch (err: any) {
        expect(err.message).to.include(
          "PreRollCollection: This collection has been deleted"
        );
      }
    });
    it("can't delete collection twice", async () => {
      try {
        await preRollCollection.connect(creator).deleteCollection(1);
        await preRollCollection.connect(creator).deleteCollection(1);
      } catch (err: any) {
        expect(err.message).to.include(
          "PreRollCollection: This collection has already been deleted."
        );
      }
    });
    it("emits collection deleted", async () => {
      const tx = await preRollCollection.connect(creator).deleteCollection(1);
      const receipt = await tx.wait();
      const event = receipt.events.find(
        (event: any) => event.event === "CollectionDeleted"
      );
      const eventData = await event.args;
      expect(eventData.sender).to.equal(creator.address);
      expect(eventData.collectionId).to.deep.equal(BigNumber.from("1"));
    });
  });

  describe("burn NFTs", async () => {
    beforeEach(async () => {
      await preRollCollection.createCollection(
        20,
        {
          price: "100000000000000000000",
          fulfillerId: 1,
          discount: 0,
          sizes: ["xs", "m", "l"],
          uri: "someuri",
          printType: "hoodie",
        },
        false
      );
      await coinOpMarket.buyTokens({
        preRollIds: [1],
        preRollAmounts: [2],
        customIds: [],
        customAmounts: [],
        customURIs: [],
        fulfillmentDetails: "fulfillmentdetails",
        chosenTokenAddress: ethAddress.address,
      });
    });
    it("burns the nft", async () => {
      await preRollNFT.burn(1);
      expect(await preRollNFT.getTokenIsBurned(1)).to.be.true;
      expect(await preRollNFT.getTokenIsBurned(2)).to.be.false;
    });
    it("burns the nft batch", async () => {
      await preRollNFT.burnBatch([1, 2]);
      expect(await preRollNFT.getTokenIsBurned(1)).to.be.true;
      expect(await preRollNFT.getTokenIsBurned(2)).to.be.true;
    });
    it("only owner can burn", async () => {
      try {
        await preRollNFT.connect(nonAdmin).burn(1);
      } catch (err: any) {
        expect(err.message).to.include(
          "ERC721Metadata: Only token owner can burn token"
        );
      }
    });
    it("only owner can burn batch", async () => {
      try {
        await preRollNFT.connect(nonAdmin).burnBatch([1, 2]);
      } catch (err: any) {
        expect(err.message).to.include(
          "ERC721Metadata: Only token owner can burn tokens"
        );
      }
    });
    it("emits burn events", async () => {
      const tx = await preRollNFT.burn(1);
      const receipt = await tx.wait();
      const event = receipt.events.find(
        (event: any) => event.event === "TokenBurned"
      );
      const eventData = await event.args;
      expect(eventData.tokenId).to.deep.equal(BigNumber.from("1"));
    });
  });

  describe("updates all contracts", () => {
    let newAccessControl: Contract,
      newCoinOpFulfillment: Contract,
      newCoinOpMarket: Contract,
      newPreRollCollection: Contract,
      newPreRollNFT: Contract,
      newCoinOpPayment: Contract;
    beforeEach(async () => {
      const CoinOpAccessControl = await ethers.getContractFactory(
        "CoinOpAccessControl"
      );
      const CoinOpFulfillment = await ethers.getContractFactory(
        "CoinOpFulfillment"
      );
      const CoinOpMarket = await ethers.getContractFactory("CoinOpMarket");
      const PreRollNFT = await ethers.getContractFactory("PreRollNFT");
      const PreRollCollection = await ethers.getContractFactory(
        "PreRollCollection"
      );
      const CoinOpPayment = await ethers.getContractFactory("CoinOpPayment");

      newAccessControl = await CoinOpAccessControl.deploy(
        "CoinOpAccessControl",
        "COAC"
      );
      newCoinOpPayment = await CoinOpPayment.deploy(
        accessControl.address,
        "CoinOpPayment",
        "COPA"
      );
      newCoinOpFulfillment = await CoinOpFulfillment.deploy(
        accessControl.address,
        "CoinOpFulfillment",
        "COFU"
      );
      newPreRollNFT = await PreRollNFT.deploy(
        accessControl.address,
        coinOpFulfillment.address
      );

      newPreRollCollection = await PreRollCollection.deploy(
        preRollNFT.address,
        accessControl.address,
        coinOpPayment.address,
        "PRCOL",
        "PreRollCollection"
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

    it("update access control nft", async () => {
      await preRollNFT.updateAccessControl(newAccessControl.address);
      expect(await preRollNFT.getAccessControlContract()).to.equal(
        newAccessControl.address
      );
    });
    it("update pre roll collection nft", async () => {
      await preRollNFT.setPreRollCollection(newPreRollCollection.address);
      expect(await preRollNFT.getPreRollCollectionContract()).to.equal(
        newPreRollCollection.address
      );
    });
    it("update fulfillment nft", async () => {
      await preRollNFT.updateFulfillment(newPreRollCollection.address);
      expect(await preRollNFT.getFulfillmentContract()).to.equal(
        newPreRollCollection.address
      );
    });
    it("update market collection", async () => {
      await preRollCollection.setCoinOpMarket(newCoinOpMarket.address);
      expect(await preRollCollection.getCoinOpMarketContract()).to.equal(
        newCoinOpMarket.address
      );
    });
    it("update payment collection", async () => {
      await preRollCollection.updateCoinOpPayment(newCoinOpPayment.address);
      expect(await preRollCollection.getCoinOpPaymentContract()).to.equal(
        newCoinOpPayment.address
      );
    });
    it("update pre roll nft collection", async () => {
      await preRollCollection.updatePreRollNFT(newPreRollNFT.address);
      expect(await preRollCollection.getPreRollNFTContract()).to.equal(
        newPreRollNFT.address
      );
    });
    it("update fulfillment collection", async () => {
      await preRollCollection.setCoinOpFulfillment(
        newCoinOpFulfillment.address
      );
      expect(await preRollCollection.getCoinOpFulfillmentContract()).to.equal(
        newCoinOpFulfillment.address
      );
    });
    it("update access control collection", async () => {
      await preRollCollection.updateAccessControl(newAccessControl.address);
      expect(await preRollCollection.getAccessControlContract()).to.equal(
        newAccessControl.address
      );
    });
    it("only admin can update", async () => {
      try {
        await preRollCollection
          .connect(nonAdmin)
          .updateAccessControl(newAccessControl.address);
      } catch (err: any) {
        expect(err.message).to.include(
          "CoinOpAccessControl: Only admin can perform this action"
        );
      }

      try {
        await preRollCollection
          .connect(nonAdmin)
          .setCoinOpFulfillment(newCoinOpFulfillment.address);
      } catch (err: any) {
        expect(err.message).to.include(
          "CoinOpAccessControl: Only admin can perform this action"
        );
      }

      try {
        await preRollCollection
          .connect(nonAdmin)
          .updatePreRollNFT(newPreRollNFT.address);
      } catch (err: any) {
        expect(err.message).to.include(
          "CoinOpAccessControl: Only admin can perform this action"
        );
      }

      try {
        await preRollCollection
          .connect(nonAdmin)
          .updateCoinOpPayment(newCoinOpPayment.address);
      } catch (err: any) {
        expect(err.message).to.include(
          "CoinOpAccessControl: Only admin can perform this action"
        );
      }

      try {
        await preRollCollection
          .connect(nonAdmin)
          .setCoinOpMarket(newCoinOpMarket.address);
      } catch (err: any) {
        expect(err.message).to.include(
          "CoinOpAccessControl: Only admin can perform this action"
        );
      }

      try {
        await preRollNFT
          .connect(nonAdmin)
          .setPreRollCollection(newPreRollCollection.address);
      } catch (err: any) {
        expect(err.message).to.include(
          "CoinOpAccessControl: Only admin can perform this action"
        );
      }

      try {
        await preRollNFT
          .connect(nonAdmin)
          .updateAccessControl(newAccessControl.address);
      } catch (err: any) {
        expect(err.message).to.include(
          "CoinOpAccessControl: Only admin can perform this action"
        );
      }

      try {
        await preRollNFT
          .connect(nonAdmin)
          .updateFulfillment(newAccessControl.address);
      } catch (err: any) {
        expect(err.message).to.include(
          "CoinOpAccessControl: Only admin can perform this action"
        );
      }
    });
  });
});
