import { ethers } from "hardhat";
import { BigNumber, Contract } from "ethers";
import chai from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
const { expect } = chai;

xdescribe("Market Contracts", function () {
  let admin: SignerWithAddress,
    nonAdmin: SignerWithAddress,
    creator: SignerWithAddress,
    fulfiller: SignerWithAddress,
    buyer: SignerWithAddress,
    secondFulfiller: SignerWithAddress,
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
    invalidAddress: Contract,
    customCompositeNFT: Contract;

  beforeEach(async () => {
    [admin, nonAdmin, fulfiller, secondFulfiller, creator, buyer] =
      await ethers.getSigners();

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
    invalidAddress = await ERC20.connect(admin).deploy();

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
    await ethAddress
      .connect(buyer)
      .approve(
        coinOpMarket.address,
        BigNumber.from("6000000000000000000000000")
      );
    await ethAddress.transfer(buyer.address, "6000000000000000000000000");
    await parentFGO.setFGOEscrow(coinOpFGOEscrow.address);
    await childFGO.setFGOEscrow(coinOpFGOEscrow.address);
    await childFGO.setParentFGO(parentFGO.address);
    await coinOpFulfillment.createFulfiller(10, fulfiller.address);
    await coinOpFulfillment.createFulfiller(34, secondFulfiller.address);
    await parentFGO.mintFGO(
      "parentURI",
      "hoodie",
      ["childuri1", "childuri2", "childuri3"],
      "100000000000000000000",
      ["20000000000000000000", "30000000000000000000", "50000000000000000000"],
      1
    );
    await parentFGO.mintFGO(
      "parentURI2",
      "sticker",
      ["childuri4", "childuri5", "childuri6"],
      "200000000000000000000",
      ["10000000000000000000", "10000000000000000000", "10000000000000000000"],
      2
    );
  });

  describe("buys tokens", () => {
    let buyerBalance: string,
      adminBalance: string,
      creatorBalance: string,
      fulfillerBalance: string,
      secondFulfillerBalance: string;
    beforeEach(async () => {
      buyerBalance = await ethAddress.balanceOf(buyer.address);
      adminBalance = await ethAddress.balanceOf(admin.address);
      await preRollCollection.connect(creator).createCollection(
        20,
        {
          price: "100000000000000000000",
          fulfillerId: 1,
          discount: 0,
          sizes: ["xs", "m", "l"],
          uri: "hoodieuri",
          printType: "hoodie",
        },
        false
      );
      await preRollCollection.connect(creator).createCollection(
        0,
        {
          price: "200000000000000000000",
          fulfillerId: 2,
          discount: 0,
          sizes: ["12x24"],
          uri: "posteruri",
          printType: "poster",
        },
        true
      );
      await coinOpMarket.connect(buyer).buyTokens({
        preRollIds: [1, 2],
        preRollAmounts: [3, 5],
        customIds: [1, 4],
        customAmounts: [2, 1],
        customURIs: ["customOne", "customTwo"],
        fulfillmentDetails: "fulfillmentdetails",
        chosenTokenAddress: ethAddress.address,
      });
    });
    it("reverts on invalid payment", async () => {
      try {
        await coinOpMarket.connect(buyer).buyTokens({
          preRollIds: [1, 2],
          preRollAmounts: [3, 5],
          customIds: [1, 2],
          customAmounts: [2, 1],
          customURIs: ["customOne", "customTwo"],
          fulfillmentDetails: "fulfillmentdetails",
          chosenTokenAddress: invalidAddress.address,
        });
      } catch (err: any) {
        expect(err.message).to.include(
          "CoinOpPayment: Not a valid chosen payment address."
        );
      }
    });
    it("reverts on incorrect amounts", async () => {
      try {
        await coinOpMarket.connect(buyer).buyTokens({
          preRollIds: [1],
          preRollAmounts: [3, 5],
          // child ids remember!
          customIds: [1, 4],
          customAmounts: [2, 1],
          customURIs: ["customOne"],
          fulfillmentDetails: "fulfillmentdetails",
          chosenTokenAddress: ethAddress.address,
        });
      } catch (err: any) {
        expect(err.message).to.include(
          "CoinOpMarket: Each token must have an amount."
        );
      }
    });
    it("creates orders", async () => {
      // order one
      expect(await coinOpMarket.getOrderDetails(1)).to.equal(
        "fulfillmentdetails"
      );
      expect(await coinOpMarket.getOrderBuyer(1)).to.equal(buyer.address);
      expect(await coinOpMarket.getOrderChosenAddress(1)).to.equal(
        ethAddress.address
      );
      expect(await coinOpMarket.getOrderStatus(1)).to.equal("ordered");
      expect(await coinOpMarket.getOrderIsFulfilled(1)).to.be.false;
      expect(await coinOpMarket.getOrderFulfillerId(1)).to.deep.equal(
        BigNumber.from("1")
      );
      expect(await coinOpMarket.getOrderTokenType(1)).to.equal("preroll");

      // order two
      expect(await coinOpMarket.getOrderDetails(2)).to.equal(
        "fulfillmentdetails"
      );
      expect(await coinOpMarket.getOrderBuyer(2)).to.equal(buyer.address);
      expect(await coinOpMarket.getOrderChosenAddress(2)).to.equal(
        ethAddress.address
      );
      expect(await coinOpMarket.getOrderStatus(2)).to.equal("ordered");
      expect(await coinOpMarket.getOrderIsFulfilled(2)).to.be.false;
      expect(await coinOpMarket.getOrderFulfillerId(2)).to.deep.equal(
        BigNumber.from("2")
      );
      expect(await coinOpMarket.getOrderTokenType(2)).to.equal("preroll");

      // order three
      expect(await coinOpMarket.getOrderDetails(3)).to.equal(
        "fulfillmentdetails"
      );
      expect(await coinOpMarket.getOrderBuyer(3)).to.equal(buyer.address);
      expect(await coinOpMarket.getOrderChosenAddress(3)).to.equal(
        ethAddress.address
      );
      expect(await coinOpMarket.getOrderStatus(3)).to.equal("ordered");
      expect(await coinOpMarket.getOrderIsFulfilled(3)).to.be.false;
      expect(await coinOpMarket.getOrderFulfillerId(3)).to.deep.equal(
        BigNumber.from("1")
      );
      expect(await coinOpMarket.getOrderTokenType(3)).to.equal("custom");

      // order four
      expect(await coinOpMarket.getOrderDetails(4)).to.equal(
        "fulfillmentdetails"
      );
      expect(await coinOpMarket.getOrderBuyer(4)).to.equal(buyer.address);
      expect(await coinOpMarket.getOrderChosenAddress(4)).to.equal(
        ethAddress.address
      );
      expect(await coinOpMarket.getOrderStatus(4)).to.equal("ordered");
      expect(await coinOpMarket.getOrderIsFulfilled(4)).to.be.false;
      expect(await coinOpMarket.getOrderFulfillerId(4)).to.deep.equal(
        BigNumber.from("2")
      );
      expect(await coinOpMarket.getOrderTokenType(4)).to.equal("custom");
    });
    it("updates order supply", async () => {
      expect(await coinOpMarket.getOrderSupply()).to.deep.equal(
        BigNumber.from("4")
      );
    });
    it("transfers the correct prices to creator and fulfiller", async () => {
      expect(await ethAddress.balanceOf(creator.address)).to.deep.equal(
        BigNumber.from("930000000000000000")
      );
      expect(await ethAddress.balanceOf(admin.address)).to.deep.equal(
        BigNumber.from("354600000000000000").add(adminBalance)
      );
      expect(await ethAddress.balanceOf(fulfiller.address)).to.deep.equal(
        BigNumber.from("54000000000000000")
      );
      expect(await ethAddress.balanceOf(secondFulfiller.address)).to.deep.equal(
        BigNumber.from("411400000000000000")
      );
      expect(await ethAddress.balanceOf(buyer.address)).to.deep.equal(
        BigNumber.from(buyerBalance).sub("1750000000000000000")
      );
    });
    it("transfers the correct prices to creator and fulfiller with discount", async () => {
      await preRollCollection.connect(creator).createCollection(
        20,
        {
          price: "100000000000000000000",
          fulfillerId: 1,
          discount: 20,
          sizes: ["xs", "m", "l"],
          uri: "hoodieuri",
          printType: "hoodie",
        },
        false
      );
      adminBalance = await ethAddress.balanceOf(admin.address);
      buyerBalance = await ethAddress.balanceOf(buyer.address);
      creatorBalance = await ethAddress.balanceOf(creator.address);
      fulfillerBalance = await ethAddress.balanceOf(fulfiller.address);
      await coinOpMarket.connect(buyer).buyTokens({
        preRollIds: [3],
        preRollAmounts: [1],
        customIds: [1],
        customAmounts: [1],
        customURIs: ["customOne"],
        fulfillmentDetails: "fulfillmentdetails",
        chosenTokenAddress: ethAddress.address,
      });

      expect(await ethAddress.balanceOf(creator.address)).to.deep.equal(
        BigNumber.from(creatorBalance).add("72000000000000000")
      );
      expect(await ethAddress.balanceOf(admin.address)).to.deep.equal(
        BigNumber.from("108000000000000000").add(adminBalance)
      );
      expect(await ethAddress.balanceOf(fulfiller.address)).to.deep.equal(
        BigNumber.from("20000000000000000").add(fulfillerBalance)
      );
      expect(await ethAddress.balanceOf(buyer.address)).to.deep.equal(
        BigNumber.from(buyerBalance).sub("200000000000000000")
      );
    });
    it("custom nfts minted correctly", async () => {
      expect(await customCompositeNFT.getTotalSupplyCount()).to.deep.equal(
        BigNumber.from("3")
      );
    });
    it("preroll nfts minted correctly", async () => {
      expect(await preRollCollection.getCollectionSupply()).to.deep.equal(
        BigNumber.from("2")
      );
      expect(await preRollNFT.getTotalSupplyCount()).to.deep.equal(
        BigNumber.from("8")
      );
    });
    it("reverts on unapproved", async () => {
      try {
        await coinOpMarket.connect(fulfiller).buyTokens({
          preRollIds: [1, 2],
          preRollAmounts: [3, 5],
          // child ids remember!
          customIds: [1, 4],
          customAmounts: [2, 1],
          customURIs: ["customOne", "customTwo"],
          fulfillmentDetails: "fulfillmentdetails",
          chosenTokenAddress: ethAddress.address,
        });
      } catch (err: any) {
        expect(err.message).to.include(
          "CoinOpMarket: Insufficient Approval Allowance."
        );
      }
    });
    it("returns the correct preroll sold count", async () => {
      expect(await coinOpMarket.getCollectionPreRollSoldCount(1)).to.deep.equal(
        BigNumber.from("3")
      );
      expect(await coinOpMarket.getCollectionPreRollSoldCount(2)).to.deep.equal(
        BigNumber.from("5")
      );
    });
    it("returns the correct preroll sold token ids", async () => {
      expect(
        await coinOpMarket.getTokensSoldCollectionPreRoll(1)
      ).to.deep.equal([
        BigNumber.from("1"),
        BigNumber.from("2"),
        BigNumber.from("3"),
      ]);
      expect(
        await coinOpMarket.getTokensSoldCollectionPreRoll(2)
      ).to.deep.equal([
        BigNumber.from("4"),
        BigNumber.from("5"),
        BigNumber.from("6"),
        BigNumber.from("7"),
        BigNumber.from("8"),
      ]);
    });
    it("returns the correct preroll sold count after second buy", async () => {
      await coinOpMarket.connect(buyer).buyTokens({
        preRollIds: [1, 2],
        preRollAmounts: [3, 5],
        // child ids remember!
        customIds: [1, 4],
        customAmounts: [2, 1],
        customURIs: ["customOne", "customTwo"],
        fulfillmentDetails: "fulfillmentdetails",
        chosenTokenAddress: ethAddress.address,
      });
      expect(await coinOpMarket.getCollectionPreRollSoldCount(1)).to.deep.equal(
        BigNumber.from("6")
      );
      expect(await coinOpMarket.getCollectionPreRollSoldCount(2)).to.deep.equal(
        BigNumber.from("10")
      );
    });
    it("returns the correct preroll sold token ids after second buy", async () => {
      await coinOpMarket.connect(buyer).buyTokens({
        preRollIds: [1, 2],
        preRollAmounts: [3, 5],
        // child ids remember!
        customIds: [1, 4],
        customAmounts: [2, 1],
        customURIs: ["customOne", "customTwo"],
        fulfillmentDetails: "fulfillmentdetails",
        chosenTokenAddress: ethAddress.address,
      });
      expect(
        await coinOpMarket.getTokensSoldCollectionPreRoll(1)
      ).to.deep.equal([
        BigNumber.from("1"),
        BigNumber.from("2"),
        BigNumber.from("3"),
        BigNumber.from("9"),
        BigNumber.from("10"),
        BigNumber.from("11"),
      ]);
      expect(
        await coinOpMarket.getTokensSoldCollectionPreRoll(2)
      ).to.deep.equal([
        BigNumber.from("4"),
        BigNumber.from("5"),
        BigNumber.from("6"),
        BigNumber.from("7"),
        BigNumber.from("8"),
        BigNumber.from("12"),
        BigNumber.from("13"),
        BigNumber.from("14"),
        BigNumber.from("15"),
        BigNumber.from("16"),
      ]);
    });
    it("update fulfillment status and type", async () => {
      await coinOpMarket.connect(fulfiller).setOrderStatus(1, "shipped");
      await coinOpMarket.connect(secondFulfiller).setOrderStatus(2, "complete");
      await coinOpMarket.connect(fulfiller).setOrderisFulfilled(1);
      expect(await coinOpMarket.getOrderStatus(1)).to.equal("shipped");
      expect(await coinOpMarket.getOrderStatus(2)).to.equal("complete");
      expect(await coinOpMarket.getOrderIsFulfilled(1)).to.be.true;
      expect(await coinOpMarket.getOrderIsFulfilled(2)).to.be.false;

      await coinOpMarket.connect(fulfiller).setOrderStatus(3, "shipped");
      await coinOpMarket.connect(secondFulfiller).setOrderStatus(4, "complete");
      await coinOpMarket.connect(fulfiller).setOrderisFulfilled(3);
      expect(await coinOpMarket.getOrderStatus(3)).to.equal("shipped");
      expect(await coinOpMarket.getOrderStatus(4)).to.equal("complete");
      expect(await coinOpMarket.getOrderIsFulfilled(3)).to.be.true;
      expect(await coinOpMarket.getOrderIsFulfilled(4)).to.be.false;
    });
    it("only fulfiller can update fulfillment status and type", async () => {
      try {
        await coinOpMarket
          .connect(secondFulfiller)
          .setOrderStatus(1, "shipped");
      } catch (err: any) {
        expect(err.message).to.include(
          "CoinOpMarket: Only the fulfiller can update this status."
        );
      }

      try {
        await coinOpMarket.connect(admin).setOrderStatus(3, "shipped");
      } catch (err: any) {
        expect(err.message).to.include(
          "CoinOpMarket: Only the fulfiller can update this status."
        );
      }
    });
    it("only buyer can update order details", async () => {
      await coinOpMarket.connect(buyer).setOrderDetails(1, "neworderdetails");
      expect(await coinOpMarket.getOrderDetails(1)).to.equal("neworderdetails");

      try {
        await coinOpMarket.setOrderDetails(1, "neworderdetails");
      } catch (err: any) {
        expect(err.message).to.include(
          "CoinOpMarket: Only the buyer can update their order details."
        );
      }
    });

    it("returns the correct order information", async () => {
      expect(await coinOpMarket.getOrderDetails(1)).to.equal(
        "fulfillmentdetails"
      );
      expect(await coinOpMarket.getOrderDetails(2)).to.equal(
        "fulfillmentdetails"
      );
      expect(await coinOpMarket.getOrderDetails(3)).to.equal(
        "fulfillmentdetails"
      );
      expect(await coinOpMarket.getOrderDetails(4)).to.equal(
        "fulfillmentdetails"
      );

      expect(await coinOpMarket.getOrderBuyer(1)).to.equal(buyer.address);
      expect(await coinOpMarket.getOrderBuyer(2)).to.equal(buyer.address);
      expect(await coinOpMarket.getOrderBuyer(3)).to.equal(buyer.address);
      expect(await coinOpMarket.getOrderBuyer(4)).to.equal(buyer.address);

      expect(await coinOpMarket.getOrderChosenAddress(1)).to.equal(
        ethAddress.address
      );
      expect(await coinOpMarket.getOrderChosenAddress(2)).to.equal(
        ethAddress.address
      );
      expect(await coinOpMarket.getOrderChosenAddress(3)).to.equal(
        ethAddress.address
      );
      expect(await coinOpMarket.getOrderChosenAddress(4)).to.equal(
        ethAddress.address
      );

      expect(await coinOpMarket.getOrderStatus(1)).to.equal("ordered");
      expect(await coinOpMarket.getOrderStatus(2)).to.equal("ordered");
      expect(await coinOpMarket.getOrderStatus(3)).to.equal("ordered");
      expect(await coinOpMarket.getOrderStatus(4)).to.equal("ordered");

      expect(await coinOpMarket.getOrderIsFulfilled(1)).to.be.false;
      expect(await coinOpMarket.getOrderIsFulfilled(2)).to.be.false;
      expect(await coinOpMarket.getOrderIsFulfilled(3)).to.be.false;
      expect(await coinOpMarket.getOrderIsFulfilled(4)).to.be.false;

      expect(await coinOpMarket.getOrderTokenType(1)).to.equal("preroll");
      expect(await coinOpMarket.getOrderTokenType(2)).to.equal("preroll");
      expect(await coinOpMarket.getOrderTokenType(3)).to.be.equal("custom");
      expect(await coinOpMarket.getOrderTokenType(4)).to.be.equal("custom");
    });
    it("works correctly with mona payment", async () => {
      await monaAddress
        .connect(buyer)
        .approve(
          coinOpMarket.address,
          BigNumber.from("6000000000000000000000000")
        );
      await monaAddress.transfer(buyer.address, "6000000000000000000000000");
      adminBalance = await monaAddress.balanceOf(admin.address);
      buyerBalance = await monaAddress.balanceOf(buyer.address);
      creatorBalance = await monaAddress.balanceOf(creator.address);
      fulfillerBalance = await monaAddress.balanceOf(fulfiller.address);
      secondFulfillerBalance = await monaAddress.balanceOf(
        secondFulfiller.address
      );

      await coinOpMarket.connect(buyer).buyTokens({
        preRollIds: [1, 2],
        preRollAmounts: [3, 5],
        // child ids remember!
        customIds: [1, 4],
        customAmounts: [2, 1],
        customURIs: ["customOne", "customTwo"],
        fulfillmentDetails: "fulfillmentdetails",
        chosenTokenAddress: monaAddress.address,
      });

      expect(await monaAddress.balanceOf(creator.address)).to.deep.equal(
        BigNumber.from("3720000000000000000").add(creatorBalance)
      );
      expect(await monaAddress.balanceOf(admin.address)).to.deep.equal(
        BigNumber.from(adminBalance).add("1418400000000000000")
      );
      expect(await monaAddress.balanceOf(fulfiller.address)).to.deep.equal(
        BigNumber.from("216000000000000000").add(fulfillerBalance)
      );
      expect(
        await monaAddress.balanceOf(secondFulfiller.address)
      ).to.deep.equal(
        BigNumber.from("1645600000000000000").add(secondFulfillerBalance)
      );
      expect(await monaAddress.balanceOf(buyer.address)).to.deep.equal(
        BigNumber.from(buyerBalance).sub("7000000000000000000")
      );
    });
    it("works correctly with matic payment", async () => {
      await maticAddress
        .connect(buyer)
        .approve(
          coinOpMarket.address,
          BigNumber.from("6000000000000000000000000")
        );
      await maticAddress.transfer(buyer.address, "6000000000000000000000000");
      adminBalance = await maticAddress.balanceOf(admin.address);
      buyerBalance = await maticAddress.balanceOf(buyer.address);
      creatorBalance = await maticAddress.balanceOf(creator.address);
      fulfillerBalance = await maticAddress.balanceOf(fulfiller.address);
      secondFulfillerBalance = await maticAddress.balanceOf(
        secondFulfiller.address
      );

      await coinOpMarket.connect(buyer).buyTokens({
        preRollIds: [1, 2],
        preRollAmounts: [3, 5],
        // child ids remember!
        customIds: [1, 4],
        customAmounts: [2, 1],
        customURIs: ["customOne", "customTwo"],
        fulfillmentDetails: "fulfillmentdetails",
        chosenTokenAddress: maticAddress.address,
      });

      expect(await maticAddress.balanceOf(creator.address)).to.deep.equal(
        BigNumber.from("930000000000000000000").add(creatorBalance)
      );
      expect(await maticAddress.balanceOf(admin.address)).to.deep.equal(
        BigNumber.from(adminBalance).add("354600000000000000000")
      );
      expect(await maticAddress.balanceOf(fulfiller.address)).to.deep.equal(
        BigNumber.from("54000000000000000000").add(fulfillerBalance)
      );
      expect(
        await maticAddress.balanceOf(secondFulfiller.address)
      ).to.deep.equal(
        BigNumber.from("411400000000000000000").add(secondFulfillerBalance)
      );
      expect(await maticAddress.balanceOf(buyer.address)).to.deep.equal(
        BigNumber.from(buyerBalance).sub("1750000000000000000000")
      );
    });
    it("works correctly with usdt payment", async () => {
      await tetherAddress
        .connect(buyer)
        .approve(
          coinOpMarket.address,
          BigNumber.from("6000000000000000000000000")
        );
      await tetherAddress.transfer(buyer.address, "6000000000000000000000000");
      adminBalance = await tetherAddress.balanceOf(admin.address);
      buyerBalance = await tetherAddress.balanceOf(buyer.address);
      creatorBalance = await tetherAddress.balanceOf(creator.address);
      fulfillerBalance = await tetherAddress.balanceOf(fulfiller.address);
      secondFulfillerBalance = await tetherAddress.balanceOf(
        secondFulfiller.address
      );

      await coinOpMarket.connect(buyer).buyTokens({
        preRollIds: [1, 2],
        preRollAmounts: [3, 5],
        // child ids remember!
        customIds: [1, 4],
        customAmounts: [2, 1],
        customURIs: ["customOne", "customTwo"],
        fulfillmentDetails: "fulfillmentdetails",
        chosenTokenAddress: tetherAddress.address,
      });

      expect(await tetherAddress.balanceOf(creator.address)).to.deep.equal(
        BigNumber.from("930000000").add(creatorBalance)
      );
      expect(await tetherAddress.balanceOf(admin.address)).to.deep.equal(
        BigNumber.from(adminBalance).add("354600000")
      );
      expect(await tetherAddress.balanceOf(fulfiller.address)).to.deep.equal(
        BigNumber.from("54000000").add(fulfillerBalance)
      );
      expect(
        await tetherAddress.balanceOf(secondFulfiller.address)
      ).to.deep.equal(BigNumber.from("411400000").add(secondFulfillerBalance));
      expect(await tetherAddress.balanceOf(buyer.address)).to.deep.equal(
        BigNumber.from(buyerBalance).sub("1750000000")
      );
    });
  });

  describe("updates all contracts", () => {
    let newAccessControl: Contract,
      newCoinOpFulfillment: Contract,
      newPreRollCollection: Contract,
      newPreRollNFT: Contract,
      newCoinOpPayment: Contract,
      newCustomCompositeNFT: Contract,
      newChildFGO: Contract,
      newParentFGO: Contract,
      newCoinOpOracle: Contract;
    beforeEach(async () => {
      const CoinOpAccessControl = await ethers.getContractFactory(
        "CoinOpAccessControl"
      );
      const CoinOpFulfillment = await ethers.getContractFactory(
        "CoinOpFulfillment"
      );
      const PreRollNFT = await ethers.getContractFactory("PreRollNFT");
      const PreRollCollection = await ethers.getContractFactory(
        "PreRollCollection"
      );
      const CoinOpPayment = await ethers.getContractFactory("CoinOpPayment");
      const ChildFGO = await ethers.getContractFactory("CoinOpChildFGO");
      const ParentFGO = await ethers.getContractFactory("CoinOpParentFGO");
      const CoinOpOracle = await ethers.getContractFactory("CoinOpOracle");
      const CustomCompositeNFT = await ethers.getContractFactory(
        "CustomCompositeNFT"
      );

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

      newCustomCompositeNFT = await CustomCompositeNFT.deploy(
        accessControl.address
      );
      newChildFGO = await ChildFGO.deploy(
        "CoinOpChildFGO",
        "COCFGO",
        accessControl.address
      );

      newParentFGO = await ParentFGO.deploy(
        childFGO.address,
        coinOpFulfillment.address,
        accessControl.address
      );
      newCoinOpOracle = await CoinOpOracle.deploy(
        accessControl.address,
        monaAddress.address,
        ethAddress.address,
        maticAddress.address,
        tetherAddress.address,
        "COOR",
        "CoinOpOracle"
      );
    });

    it("access control updated", async () => {
      await coinOpMarket.updateAccessControl(newAccessControl.address);
      expect(await coinOpMarket.getAccessControlContract()).to.equal(
        newAccessControl.address
      );
    });
    it("fulfillment updated", async () => {
      await coinOpMarket.updateCoinOpFulfillment(newCoinOpFulfillment.address);
      expect(await coinOpMarket.getCoinOpFulfillmentContract()).to.equal(
        newCoinOpFulfillment.address
      );
    });
    it("collection updated", async () => {
      await coinOpMarket.updatePreRollCollection(newPreRollCollection.address);
      expect(await coinOpMarket.getPreRollCollectionContract()).to.equal(
        newPreRollCollection.address
      );
    });
    it("nft updated", async () => {
      await coinOpMarket.updatePreRollNFT(newPreRollNFT.address);
      expect(await coinOpMarket.getPreRollNFTContract()).to.equal(
        newPreRollNFT.address
      );
    });
    it("custom updated", async () => {
      await coinOpMarket.updateCompositeNFT(newCustomCompositeNFT.address);
      expect(await coinOpMarket.getCompositeNFTContract()).to.equal(
        newCustomCompositeNFT.address
      );
    });
    it("child updated", async () => {
      await coinOpMarket.updateChildFGO(newChildFGO.address);
      expect(await coinOpMarket.getChildFGOContract()).to.equal(
        newChildFGO.address
      );
    });
    it("parent updated", async () => {
      await coinOpMarket.updateParentFGO(newParentFGO.address);
      expect(await coinOpMarket.getParentFGOContract()).to.equal(
        newParentFGO.address
      );
    });
    it("oracle updated", async () => {
      await coinOpMarket.updateOracle(newCoinOpOracle.address);
      expect(await coinOpMarket.getOracleContract()).to.equal(
        newCoinOpOracle.address
      );
    });
    it("payment updated", async () => {
      await coinOpMarket.updateCoinOpPayment(newCoinOpPayment.address);
      expect(await coinOpMarket.getCoinOpPayment()).to.equal(
        newCoinOpPayment.address
      );
    });
    it("only the admin can update", async () => {
      try {
        await coinOpMarket
          .connect(nonAdmin)
          .updateCoinOpPayment(newCoinOpPayment.address);
      } catch (err: any) {
        expect(err.message).to.include(
          "CoinOpAccessControl: Only admin can perform this action"
        );
      }
      try {
        await coinOpMarket
          .connect(nonAdmin)
          .updateOracle(newCoinOpOracle.address);
      } catch (err: any) {
        expect(err.message).to.include(
          "CoinOpAccessControl: Only admin can perform this action"
        );
      }
      try {
        await coinOpMarket
          .connect(nonAdmin)
          .updateParentFGO(newParentFGO.address);
      } catch (err: any) {
        expect(err.message).to.include(
          "CoinOpAccessControl: Only admin can perform this action"
        );
      }
      try {
        await coinOpMarket
          .connect(nonAdmin)
          .updateChildFGO(newChildFGO.address);
      } catch (err: any) {
        expect(err.message).to.include(
          "CoinOpAccessControl: Only admin can perform this action"
        );
      }
      try {
        await coinOpMarket
          .connect(nonAdmin)
          .updateCompositeNFT(newCustomCompositeNFT.address);
      } catch (err: any) {
        expect(err.message).to.include(
          "CoinOpAccessControl: Only admin can perform this action"
        );
      }
      try {
        await coinOpMarket
          .connect(nonAdmin)
          .updatePreRollNFT(newPreRollNFT.address);
      } catch (err: any) {
        expect(err.message).to.include(
          "CoinOpAccessControl: Only admin can perform this action"
        );
      }
      try {
        await coinOpMarket
          .connect(nonAdmin)
          .updatePreRollCollection(newPreRollCollection.address);
      } catch (err: any) {
        expect(err.message).to.include(
          "CoinOpAccessControl: Only admin can perform this action"
        );
      }
      try {
        await coinOpMarket
          .connect(nonAdmin)
          .updateAccessControl(newAccessControl.address);
      } catch (err: any) {
        expect(err.message).to.include(
          "CoinOpAccessControl: Only admin can perform this action"
        );
      }
      try {
        await coinOpMarket
          .connect(nonAdmin)
          .updateCoinOpFulfillment(newCoinOpFulfillment.address);
      } catch (err: any) {
        expect(err.message).to.include(
          "CoinOpAccessControl: Only admin can perform this action"
        );
      }
    });
  });
});
