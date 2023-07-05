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

});
