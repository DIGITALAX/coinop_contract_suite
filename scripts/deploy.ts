import { run } from "hardhat";

const main = async () => {
  try {
    // const CoinOpAccessControl = await ethers.getContractFactory(
    //   "CoinOpAccessControl"
    // );
    // const CustomCompositeNFT = await ethers.getContractFactory(
    //   "CustomCompositeNFT"
    // );
    // const CoinOpPayment = await ethers.getContractFactory("CoinOpPayment");
    // const CoinOpFulfillment = await ethers.getContractFactory(
    //   "CoinOpFulfillment"
    // );
    // const CoinOpFGOEscrow = await ethers.getContractFactory("CoinOpFGOEscrow");
    // const ChildFGO = await ethers.getContractFactory("CoinOpChildFGO");
    // const ParentFGO = await ethers.getContractFactory("CoinOpParentFGO");
    // const CoinOpOracle = await ethers.getContractFactory("CoinOpOracle");
    // const PreRollNFT = await ethers.getContractFactory("PreRollNFT");
    // const PreRollCollection = await ethers.getContractFactory(
    //   "PreRollCollection"
    // );
    // const CoinOpMarket = await ethers.getContractFactory("CoinOpMarket");
    // const accessControl = await CoinOpAccessControl.deploy(
    //   "CoinOpAccessControl",
    //   "COAC"
    // );
    // const coinOpPayment = await CoinOpPayment.deploy(
    //   accessControl.address,
    //   "CoinOpPayment",
    //   "COPA"
    // );
    // const customCompositeNFT = await CustomCompositeNFT.deploy(
    //   accessControl.address
    // );
    // const coinOpFulfillment = await CoinOpFulfillment.deploy(
    //   "0xA98121286825f5B1Fec5AdcC8F481f473Be566c7",
    //   "CoinOpFulfillment",
    //   "COFU"
    // );
    // const childFGO = await ChildFGO.deploy(
    //   "CoinOpChildFGO",
    //   "COCFGO",
    //   "0xA98121286825f5B1Fec5AdcC8F481f473Be566c7"
    // // );
    // const parentFGO = await ParentFGO.deploy(
    //   "0xC45D0C23F64aB9cB721b2246Cb3DFd699dBF8393",
    //   "0x7370432A618E763D7a347575Fa732322072397A2",
    //   "0xA98121286825f5B1Fec5AdcC8F481f473Be566c7"
    // );
    // const coinOpFGOEscrow = await CoinOpFGOEscrow.deploy(
    //   parentFGO.address,
    //   "0xC45D0C23F64aB9cB721b2246Cb3DFd699dBF8393",
    //   "0xA98121286825f5B1Fec5AdcC8F481f473Be566c7",
    //   "COEFGO",
    //   "CoinOpFGOEscrow"
    // );
    /*******************/
    /* ONLY FOR TESTNET MUMBAI */
    /*******************/
    // const Mona = await ethers.getContractFactory("TestToken");
    // const monaAddress = await Mona.deploy();
    // const Matic = await ethers.getContractFactory("TestToken");
    // const maticAddress = await Matic.deploy();
    // const Eth = await ethers.getContractFactory("TestToken");
    // const ethAddress = await Eth.deploy();
    // const Tether = await ethers.getContractFactory("TestToken");
    // const tetherAddress = await Tether.deploy();
    // monaAddress.deployTransaction.wait(20);
    // maticAddress.deployTransaction.wait(20);
    // ethAddress.deployTransaction.wait(20);
    // tetherAddress.deployTransaction.wait(20);
    // console.log(
    //   monaAddress.address,
    //   maticAddress.address,
    //   ethAddress.address,
    //   tetherAddress.address
    // );
    /*******************/
    // const coinOpOracle = await CoinOpOracle.deploy(
    //   "0xA98121286825f5B1Fec5AdcC8F481f473Be566c7",
    //   "0xF87b6343C172720aC9cC7d1C9465d63454A8EF30",
    //   "0x566d63F1cC7f45Bfc9B2bdC785ffcc6F858F0997",
    //   "0x3cf7283c025D82390E86d2FeB96EDA32A393036B",
    //   "0x07b722856369F6B923e1F276ABcA58dd3d15243d",
    //   "COOR",
    //   "CoinOpOracle"
    // );
    // const preRollNFT = await PreRollNFT.deploy(
    //   "0xA98121286825f5B1Fec5AdcC8F481f473Be566c7",
    //   "0x7370432A618E763D7a347575Fa732322072397A2"
    // );
    // const preRollCollection = await PreRollCollection.deploy(
    //   "0x510682452E96f0fF873C140B2e73324C67F2CC5E",
    //   "0xA98121286825f5B1Fec5AdcC8F481f473Be566c7",
    //   "0x2b85869418EeC27d6fBF4845B12B7815a916fF13",
    //   "PRCOL",
    //   "PreRollCollection"
    // );
    // const coinOpMarket = await CoinOpMarket.deploy(
    //   preRollCollection.address,
    //   "0xA98121286825f5B1Fec5AdcC8F481f473Be566c7",
    //   "0x7370432A618E763D7a347575Fa732322072397A2",
    //   "0x9Ef810FFC38EdE19008e746c9b56Bed75cA02786",
    //   "0xC45D0C23F64aB9cB721b2246Cb3DFd699dBF8393",
    //   "0x4746b75A6C8Bb1698C8735c630CBfAf6D383E79c",
    //   "0xe25F9302A6cf9FC00B8f2a878157177d9A4044A0",
    //   "0x2b85869418EeC27d6fBF4845B12B7815a916fF13",
    //   "0x510682452E96f0fF873C140B2e73324C67F2CC5E",
    //   "COMA",
    //   "CoinOpMarket"
    // );
    const WAIT_BLOCK_CONFIRMATIONS = 20;
    // accessControl.deployTransaction.wait(WAIT_BLOCK_CONFIRMATIONS);
    // coinOpPayment.deployTransaction.wait(WAIT_BLOCK_CONFIRMATIONS);
    // customCompositeNFT.deployTransaction.wait(WAIT_BLOCK_CONFIRMATIONS);
    // coinOpFulfillment.deployTransaction.wait(WAIT_BLOCK_CONFIRMATIONS);
    // childFGO.deployTransaction.wait(WAIT_BLOCK_CONFIRMATIONS);
    // parentFGO.deployTransaction.wait(WAIT_BLOCK_CONFIRMATIONS);
    // coinOpFGOEscrow.deployTransaction.wait(WAIT_BLOCK_CONFIRMATIONS);
    // coinOpOracle.deployTransaction.wait(WAIT_BLOCK_CONFIRMATIONS);
    // preRollNFT.deployTransaction.wait(WAIT_BLOCK_CONFIRMATIONS);
    // preRollCollection.deployTransaction.wait(WAIT_BLOCK_CONFIRMATIONS);
    // coinOpMarket.deployTransaction.wait(WAIT_BLOCK_CONFIRMATIONS);
    // console.log(`Coin Op Access Control deployed at\n${accessControl.address}`);
    // console.log(`Coin Op Payment deployed at\n${coinOpPayment.address}`);
    // console.log(
    //   `Custom Composite NFT deployed at\n${customCompositeNFT.address}`
    // );
    // console.log(
    //   `Coin Op Fulfillment deployed at\n${coinOpFulfillment.address}`
    // );
    // console.log(`Child FGO deployed at\n${childFGO.address}`);
    // console.log(`Parent FGO deployed at\n${parentFGO.address}`);
    // console.log(`Coin Op Escrow deployed at\n${coinOpFGOEscrow.address}`);
    // console.log(`Coin Op Oracle deployed at\n${coinOpOracle.address}`);
    // console.log(
    //   `Pre Roll Collection deployed at\n${preRollCollection.address}`
    // );
    // console.log(`Pre Roll NFT deployed at\n${preRollNFT.address}`);
    // console.log(`Coin Op Market deployed at\n${coinOpMarket.address}`);
    // await run(`verify:verify`, {
    //   address: "0xA98121286825f5B1Fec5AdcC8F481f473Be566c7",
    //   constructorArguments: ["CoinOpAccessControl", "COAC"],
    // });
    // await run(`verify:verify`, {
    //   address: "0x2b85869418EeC27d6fBF4845B12B7815a916fF13",
    //   constructorArguments: [
    //     "0xA98121286825f5B1Fec5AdcC8F481f473Be566c7",
    //     "CoinOpPayment",
    //     "COPA",
    //   ],
    // });
    // await run(`verify:verify`, {
    //   address: "0x9Ef810FFC38EdE19008e746c9b56Bed75cA02786",
    //   constructorArguments: ["0xA98121286825f5B1Fec5AdcC8F481f473Be566c7"],
    // });
    // await run(`verify:verify`, {
    //   address: "0x7370432A618E763D7a347575Fa732322072397A2",
    //   constructorArguments: [
    //     "0xA98121286825f5B1Fec5AdcC8F481f473Be566c7",
    //     "CoinOpFulfillment",
    //     "COFU",
    //   ],
    // });
    // await run(`verify:verify`, {
    //   address: "0xC45D0C23F64aB9cB721b2246Cb3DFd699dBF8393",
    //   constructorArguments: [
    //     "CoinOpChildFGO",
    //     "COCFGO",
    //     "0xA98121286825f5B1Fec5AdcC8F481f473Be566c7",
    //   ],
    // });
    await run(`verify:verify`, {
      address: "0xEA8D31a324BB4942106A3636B6033DFF43192567",
      constructorArguments: [
        "0xC45D0C23F64aB9cB721b2246Cb3DFd699dBF8393",
        "0x7370432A618E763D7a347575Fa732322072397A2",
        "0xA98121286825f5B1Fec5AdcC8F481f473Be566c7",
      ],
    });
    await run(`verify:verify`, {
      address: "0xc233BE781577d8857B66CA6c0746F1c45b318b90",
      constructorArguments: [
        "0xEA8D31a324BB4942106A3636B6033DFF43192567",
        "0xC45D0C23F64aB9cB721b2246Cb3DFd699dBF8393",
        "0xA98121286825f5B1Fec5AdcC8F481f473Be566c7",
        "COEFGO",
        "CoinOpFGOEscrow",
      ],
    });
    // await run(`verify:verify`, {
    //   address: "0xe25F9302A6cf9FC00B8f2a878157177d9A4044A0",
    //   constructorArguments: [
    //     "0xA98121286825f5B1Fec5AdcC8F481f473Be566c7",
    //     "0xF87b6343C172720aC9cC7d1C9465d63454A8EF30",
    //     "0x566d63F1cC7f45Bfc9B2bdC785ffcc6F858F0997",
    //     "0x3cf7283c025D82390E86d2FeB96EDA32A393036B",
    //     "0x07b722856369F6B923e1F276ABcA58dd3d15243d",
    //     "COOR",
    //     "CoinOpOracle",
    //   ],
    // });
    // await run(`verify:verify`, {
    //   address: "0x510682452E96f0fF873C140B2e73324C67F2CC5E",
    //   constructorArguments: [
    //     "0xA98121286825f5B1Fec5AdcC8F481f473Be566c7",
    //     "0x7370432A618E763D7a347575Fa732322072397A2",
    //   ],
    // });
    // await run(`verify:verify`, {
    //   address: "0x217bCB5Da05C765095c61c084e30EEB256F8d406",
    //   constructorArguments: [
    //     "0x510682452E96f0fF873C140B2e73324C67F2CC5E",
    //     "0xA98121286825f5B1Fec5AdcC8F481f473Be566c7",
    //     "0x2b85869418EeC27d6fBF4845B12B7815a916fF13",
    //     "PRCOL",
    //     "PreRollCollection",
    //   ],
    // });
    // await run(`verify:verify`, {
    //   address: "0xC8Ff877C4e2297f28cf0f6961aeb645332B55799",
    //   constructorArguments: [
    //     "0x217bCB5Da05C765095c61c084e30EEB256F8d406",
    //     "0xA98121286825f5B1Fec5AdcC8F481f473Be566c7",
    //     "0x7370432A618E763D7a347575Fa732322072397A2",
    //     "0x9Ef810FFC38EdE19008e746c9b56Bed75cA02786",
    //     "0xC45D0C23F64aB9cB721b2246Cb3DFd699dBF8393",
    //     "0x4746b75A6C8Bb1698C8735c630CBfAf6D383E79c",
    //     "0xe25F9302A6cf9FC00B8f2a878157177d9A4044A0",
    //     "0x2b85869418EeC27d6fBF4845B12B7815a916fF13",
    //     "0x510682452E96f0fF873C140B2e73324C67F2CC5E",
    //     "COMA",
    //     "CoinOpMarket",
    //   ],
    // });
  } catch (err: any) {
    console.error(err.message);
  }
};

main();
