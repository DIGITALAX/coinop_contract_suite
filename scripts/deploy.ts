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
    //   "0xB654b4D63a3F9311F6647d91bC4f3FfE1E5d200A",
    //   "CoinOpFulfillment",
    //   "COFU"
    // );
    // const childFGO = await ChildFGO.deploy(
    //   "CoinOpChildFGO",
    //   "COCFGO",
    //   "0xB654b4D63a3F9311F6647d91bC4f3FfE1E5d200A"
    // );
    // const parentFGO = await ParentFGO.deploy(
    //   "0x855a37e1d36e5665100419b403C9d8e7D84980BB",
    //   "0xF80D3044B28807f52EFB38e37b681eFF9D2867b9",
    //   "0xB654b4D63a3F9311F6647d91bC4f3FfE1E5d200A"
    // );
    // const coinOpFGOEscrow = await CoinOpFGOEscrow.deploy(
    //   parentFGO.address,
    //   "0x855a37e1d36e5665100419b403C9d8e7D84980BB",
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
    //   "0xB654b4D63a3F9311F6647d91bC4f3FfE1E5d200A",
    //   "0xF80D3044B28807f52EFB38e37b681eFF9D2867b9"
    // );
    // const preRollCollection = await PreRollCollection.deploy(
    //   preRollNFT.address,
    //   "0xB654b4D63a3F9311F6647d91bC4f3FfE1E5d200A",
    //   "0xcA9360280Dac5960595A8D0cB3d73dEa1a0B9625",
    //   "PRCOL",
    //   "PreRollCollection"
    // );
    // const coinOpMarket = await CoinOpMarket.deploy(
    //   "0x3f4adD04f00D392564cC6811227CE98c060e4c41",
    //   "0xB654b4D63a3F9311F6647d91bC4f3FfE1E5d200A",
    //   "0xF80D3044B28807f52EFB38e37b681eFF9D2867b9",
    //   "0x28F4Fb4ac48eb3D69f4E63D5cDc78f9D357D2cD7",
    //   "0x855a37e1d36e5665100419b403C9d8e7D84980BB",
    //   "0x2A7cb9f3bc5B16E02D63997c5c893626c9D546B9",
    //   "0x31bbf0CD528aCb595E9F2dEdeb2f0771AeFD6368",
    //   "0xcA9360280Dac5960595A8D0cB3d73dEa1a0B9625",
    //   "0xd6cF186a6D977E4785621C86918c7F3E50128053",
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
    await run(`verify:verify`, {
      address: "0xB654b4D63a3F9311F6647d91bC4f3FfE1E5d200A",
      constructorArguments: ["CoinOpAccessControl", "COAC"],
    });
    await run(`verify:verify`, {
      address: "0xcA9360280Dac5960595A8D0cB3d73dEa1a0B9625",
      constructorArguments: [
        "0xB654b4D63a3F9311F6647d91bC4f3FfE1E5d200A",
        "CoinOpPayment",
        "COPA",
      ],
    });
    // await run(`verify:verify`, {
    //   address: "0x28F4Fb4ac48eb3D69f4E63D5cDc78f9D357D2cD7",
    //   constructorArguments: ["0xB654b4D63a3F9311F6647d91bC4f3FfE1E5d200A"],
    // });
    // await run(`verify:verify`, {
    //   address: "0xF80D3044B28807f52EFB38e37b681eFF9D2867b9",
    //   constructorArguments: [
    //     "0xB654b4D63a3F9311F6647d91bC4f3FfE1E5d200A",
    //     "CoinOpFulfillment",
    //     "COFU",
    //   ],
    // });
    // await run(`verify:verify`, {
    //   address: "0x855a37e1d36e5665100419b403C9d8e7D84980BB",
    //   constructorArguments: [
    //     "CoinOpChildFGO",
    //     "COCFGO",
    //     "0xB654b4D63a3F9311F6647d91bC4f3FfE1E5d200A",
    //   ],
    // });
    // await run(`verify:verify`, {
    //   address: "0x2A7cb9f3bc5B16E02D63997c5c893626c9D546B9",
    //   constructorArguments: [
    //     "0x855a37e1d36e5665100419b403C9d8e7D84980BB",
    //     "0xF80D3044B28807f52EFB38e37b681eFF9D2867b9",
    //     "0xB654b4D63a3F9311F6647d91bC4f3FfE1E5d200A",
    //   ],
    // });
    // await run(`verify:verify`, {
    //   address: "0xF9e76BD78A042908dc3C490A2901208A49c2Ff71",
    //   constructorArguments: [
    //     "0x2A7cb9f3bc5B16E02D63997c5c893626c9D546B9",
    //     "0x855a37e1d36e5665100419b403C9d8e7D84980BB",
    //     "0xA98121286825f5B1Fec5AdcC8F481f473Be566c7",
    //     "COEFGO",
    //     "CoinOpFGOEscrow",
    //   ],
    // });
    // await run(`verify:verify`, {
    //   address: "0x31bbf0CD528aCb595E9F2dEdeb2f0771AeFD6368",
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
    //   address: "0xd6cF186a6D977E4785621C86918c7F3E50128053",
    //   constructorArguments: [
    //     "0xB654b4D63a3F9311F6647d91bC4f3FfE1E5d200A",
    //     "0xF80D3044B28807f52EFB38e37b681eFF9D2867b9",
    //   ],
    // });
    // await run(`verify:verify`, {
    //   address: "0x3f4adD04f00D392564cC6811227CE98c060e4c41",
    //   constructorArguments: [
    //     "0xd6cF186a6D977E4785621C86918c7F3E50128053",
    //     "0xB654b4D63a3F9311F6647d91bC4f3FfE1E5d200A",
    //     "0xcA9360280Dac5960595A8D0cB3d73dEa1a0B9625",
    //     "PRCOL",
    //     "PreRollCollection",
    //   ],
    // });
    // await run(`verify:verify`, {
    //   address: "0xcbe751a5982FAbAd2e9a53A99cC5842b006dbb69",
    //   constructorArguments: [
    //     "0x3f4adD04f00D392564cC6811227CE98c060e4c41",
    //     "0xB654b4D63a3F9311F6647d91bC4f3FfE1E5d200A",
    //     "0xF80D3044B28807f52EFB38e37b681eFF9D2867b9",
    //     "0x28F4Fb4ac48eb3D69f4E63D5cDc78f9D357D2cD7",
    //     "0x855a37e1d36e5665100419b403C9d8e7D84980BB",
    //     "0x2A7cb9f3bc5B16E02D63997c5c893626c9D546B9",
    //     "0x31bbf0CD528aCb595E9F2dEdeb2f0771AeFD6368",
    //     "0xcA9360280Dac5960595A8D0cB3d73dEa1a0B9625",
    //     "0xd6cF186a6D977E4785621C86918c7F3E50128053",
    //     "COMA",
    //     "CoinOpMarket",
    //   ],
    // });
  } catch (err: any) {
    console.error(err.message);
  }
};

main();
