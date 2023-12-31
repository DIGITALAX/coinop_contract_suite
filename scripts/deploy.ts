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
    // const ChildFGO = await ethers.getContractFactory("CoinOpChildFGO");
    // const ParentFGO = await ethers.getContractFactory("CoinOpParentFGO");
    // // const CoinOpOracle = await ethers.getContractFactory("CoinOpOracle");
    // const CoinOpFGOEscrow = await ethers.getContractFactory("CoinOpFGOEscrow");
    // const PreRollNFT = await ethers.getContractFactory("PreRollNFT");
    // const PreRollCollection = await ethers.getContractFactory(
    //   "PreRollCollection"
    // );
    // const CoinOpMarket = await ethers.getContractFactory("CoinOpMarket");
    // const CoinOpPKPs = await ethers.getContractFactory("CoinOpPKPs");
    // const CoinOpSubscription = await ethers.getContractFactory(
    //   "CoinOpSubscription"
    // );
    // const CoinOpPreludePoints = await ethers.getContractFactory(
    //   "CoinOpPreludePoints"
    // );
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
    //   "0xB85622D6afF34EC053C72D8DddCC45CE178eA0Ce"
    // );
    // const coinOpFulfillment = await CoinOpFulfillment.deploy(
    //   "0xB85622D6afF34EC053C72D8DddCC45CE178eA0Ce",
    //   "CoinOpFulfillment",
    //   "COFU"
    // );
    // const childFGO = await ChildFGO.deploy(
    //   "CoinOpChildFGO",
    //   "COCFGO",
    //   "0xB85622D6afF34EC053C72D8DddCC45CE178eA0Ce"
    // );
    // const parentFGO = await ParentFGO.deploy(
    //   childFGO.address,
    //   "0x84E7493b1DB31bf643FD0C8A129B3b8acfD9413b",
    //   "0xB85622D6afF34EC053C72D8DddCC45CE178eA0Ce"
    // );
    // const coinOpFGOEscrow = await CoinOpFGOEscrow.deploy(
    //   "0x7BAae0D2aBD4F076b2D83442043105e4B49B4F02",
    //   "0xa4b4B4529a67a16656e31d587452a6F0331313e5",
    //   "0xB85622D6afF34EC053C72D8DddCC45CE178eA0Ce",
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
    //   "0xB85622D6afF34EC053C72D8DddCC45CE178eA0Ce",
    //   "0x6968105460f67c3bf751be7c15f92f5286fd0ce5",
    //   "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
    //   "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
    //   "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
    //   "COOR",
    //   "CoinOpOracle"
    // );
    // const preRollNFT = await PreRollNFT.deploy(
    //   "0xB85622D6afF34EC053C72D8DddCC45CE178eA0Ce",
    //   "0x84E7493b1DB31bf643FD0C8A129B3b8acfD9413b"
    // );
    // const preRollCollection = await PreRollCollection.deploy(
    //   "0xb3Af71B719aE0463183B2235BB48073F983DACC7",
    //   "0xB85622D6afF34EC053C72D8DddCC45CE178eA0Ce",
    //   "0x1828808b73e26Aa6c5b014B56D8ac7C0823BF658",
    //   "PRCOL",
    //   "PreRollCollection"
    // );
    // const coinOpPKPs = await CoinOpPKPs.deploy(
    //   // "0xB85622D6afF34EC053C72D8DddCC45CE178eA0Ce",
    //   // "0xb1d06c81fd47dd1abb1172feb369306a2746f220",
    //   "0xB654b4D63a3F9311F6647d91bC4f3FfE1E5d200A",
    //   "0xb1d06c81fd47dd1abb1172feb369306a2746f220",
    //   "CoinOpPKPs",
    //   "COPK"
    // );
    // const coinOpSubscription = await CoinOpSubscription.deploy(
    //   // "0xB85622D6afF34EC053C72D8DddCC45CE178eA0Ce",
    //   // "0x1c6cE9018c8F3BDa3C527817CB324b8a85Af11A3",
    //   // "0xb1d06c81fd47dd1abb1172feb369306a2746f220",
    //   "0xB654b4D63a3F9311F6647d91bC4f3FfE1E5d200A",
    //   coinOpPKPs.address,
    //   "0xb1d06c81fd47dd1abb1172feb369306a2746f220",
    //   "CoinOpSubscription",
    //   "COSU"
    // );
    // const coinOpPreludePoints = await CoinOpPreludePoints.deploy(
    //   "0xB85622D6afF34EC053C72D8DddCC45CE178eA0Ce",
    //   "CoinOpPreludePoints",
    //   "COPP",
    //   "0xb1d06c81fd47dd1abb1172feb369306a2746f220"
    // );
    // const coinOpMarket = await CoinOpMarket.deploy(
    //   // {
    //   //   preRollCollection: "0x453511e08F3AF28F0A47620bb5f32479F4E2e280",
    //   //   preRollNFT: "0x6b0f8a590B14AF1579d7230060e0E8284eD1084B",
    //   //   coinOpPKPs: coinOpPKPs.address,
    //   //   coinOpPayment: "0x1828808b73e26Aa6c5b014B56D8ac7C0823BF658",
    //   //   oracle: "0x7e066A206a982F7Aa0d6d0D4c5bC74E4bD048dF3",
    //   //   accessControl: "0xB85622D6afF34EC053C72D8DddCC45CE178eA0Ce",
    //   //   coinOpFulfillment: "0x84E7493b1DB31bf643FD0C8A129B3b8acfD9413b",
    //   //   customCompositeNFT: "0xB1d40C45B332A6d18319799E964fDa4A4b47aa7e",
    //   //   childFGO: "0xa4b4B4529a67a16656e31d587452a6F0331313e5",
    //   //   parentFGO: "0x7BAae0D2aBD4F076b2D83442043105e4B49B4F02",
    //   //   pkpAddress: "0xb1d06c81fd47dd1abb1172feb369306a2746f220",
    //   // },
    //   {
    //     preRollCollection: "0x3f4adD04f00D392564cC6811227CE98c060e4c41",
    //     preRollNFT: "0xd6cF186a6D977E4785621C86918c7F3E50128053",
    //     coinOpPKPs: coinOpPKPs.address,
    //     coinOpPayment: "0xcA9360280Dac5960595A8D0cB3d73dEa1a0B9625",
    //     oracle: "0x31bbf0CD528aCb595E9F2dEdeb2f0771AeFD6368",
    //     accessControl: "0xB654b4D63a3F9311F6647d91bC4f3FfE1E5d200A",
    //     coinOpFulfillment: "0xF80D3044B28807f52EFB38e37b681eFF9D2867b9",
    //     customCompositeNFT: "0x28F4Fb4ac48eb3D69f4E63D5cDc78f9D357D2cD7",
    //     childFGO: "0x855a37e1d36e5665100419b403C9d8e7D84980BB",
    //     parentFGO: "0x2A7cb9f3bc5B16E02D63997c5c893626c9D546B9",
    //     pkpAddress: "0xb1d06c81fd47dd1abb1172feb369306a2746f220",
    //   },
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
    // coinOpPKPs.deployTransaction.wait(WAIT_BLOCK_CONFIRMATIONS);
    // coinOpSubscription.deployTransaction.wait(WAIT_BLOCK_CONFIRMATIONS);
    // coinOpMarket.deployTransaction.wait(WAIT_BLOCK_CONFIRMATIONS); 
    // coinOpPreludePoints.deployTransaction.wait(WAIT_BLOCK_CONFIRMATIONS);
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
    // console.log(`Coin Op PKPs deployed at\n${coinOpPKPs.address}`);
    // console.log(
    //   `Coin Op Subscription deployed at\n${coinOpSubscription.address}`
    // );
    // console.log(`Coin Op Market deployed at\n${coinOpMarket.address}`);
    // console.log(`Coin Op Prelude Points deployed at\n${coinOpPreludePoints.address}`);
    // await run(`verify:verify`, {
    //   address: "0xB85622D6afF34EC053C72D8DddCC45CE178eA0Ce",
    //   constructorArguments: ["CoinOpAccessControl", "COAC"],
    // });
    // await run(`verify:verify`, {
    //   address: "0x1828808b73e26Aa6c5b014B56D8ac7C0823BF658",
    //   constructorArguments: [
    //     "0xB85622D6afF34EC053C72D8DddCC45CE178eA0Ce",
    //     "CoinOpPayment",
    //     "COPA",
    //   ],
    // });
    // await run(`verify:verify`, {
    //   address: "0xB1d40C45B332A6d18319799E964fDa4A4b47aa7e",
    //   constructorArguments: ["0xB85622D6afF34EC053C72D8DddCC45CE178eA0Ce"],
    // });
    // await run(`verify:verify`, {
    //   address: "0x84E7493b1DB31bf643FD0C8A129B3b8acfD9413b",
    //   constructorArguments: [
    //     "0xB85622D6afF34EC053C72D8DddCC45CE178eA0Ce",
    //     "CoinOpFulfillment",
    //     "COFU",
    //   ],
    // });
    // await run(`verify:verify`, {
    //   address: "0xa4b4B4529a67a16656e31d587452a6F0331313e5",
    //   constructorArguments: [
    //     "CoinOpChildFGO",
    //     "COCFGO",
    //     "0xB85622D6afF34EC053C72D8DddCC45CE178eA0Ce",
    //   ],
    // });
    // await run(`verify:verify`, {
    //   address: "0x7BAae0D2aBD4F076b2D83442043105e4B49B4F02",
    //   constructorArguments: [
    //     "0xa4b4B4529a67a16656e31d587452a6F0331313e5",
    //     "0x84E7493b1DB31bf643FD0C8A129B3b8acfD9413b",
    //     "0xB85622D6afF34EC053C72D8DddCC45CE178eA0Ce",
    //   ],
    // });
    // await run(`verify:verify`, {
    //   address: "0xdc96E334135f2d8368D4a71dAE904AF655449A6F",
    //   constructorArguments: [
    //     "0x7BAae0D2aBD4F076b2D83442043105e4B49B4F02",
    //     "0xa4b4B4529a67a16656e31d587452a6F0331313e5",
    //     "0xB85622D6afF34EC053C72D8DddCC45CE178eA0Ce",
    //     "COEFGO",
    //     "CoinOpFGOEscrow",
    //   ],
    // });
    // await run(`verify:verify`, {
    //   address: "0x7e066A206a982F7Aa0d6d0D4c5bC74E4bD048dF3",
    //   constructorArguments: [
    //     "0xB85622D6afF34EC053C72D8DddCC45CE178eA0Ce",
    //     "0x6968105460f67c3bf751be7c15f92f5286fd0ce5",
    //     "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
    //     "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
    //     "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
    //     "COOR",
    //     "CoinOpOracle",
    //   ],
    // });
    // await run(`verify:verify`, {
    //   address: "0x6b0f8a590B14AF1579d7230060e0E8284eD1084B",
    //   constructorArguments: [
    //     "0xB85622D6afF34EC053C72D8DddCC45CE178eA0Ce",
    //     "0x84E7493b1DB31bf643FD0C8A129B3b8acfD9413b"
    //   ],
    // });
    // await run(`verify:verify`, {
    //   address: "0x453511e08F3AF28F0A47620bb5f32479F4E2e280",
    //   constructorArguments: [
    //     "0xb3Af71B719aE0463183B2235BB48073F983DACC7",
    //     "0xB85622D6afF34EC053C72D8DddCC45CE178eA0Ce",
    //     "0x1828808b73e26Aa6c5b014B56D8ac7C0823BF658",
    //     "PRCOL",
    //     "PreRollCollection",
    //   ],
    // });
    // await run(`verify:verify`, {
    //   address: "0x0b6a690285852A7C44cdEBD1F31B857Bc0803953",
    //   constructorArguments: [
    //     "0xB654b4D63a3F9311F6647d91bC4f3FfE1E5d200A",
    //     "0xb1d06c81fd47dd1abb1172feb369306a2746f220",
    //     "CoinOpPKPs",
    //     "COPK",
    //   ],
    // });
    // await run(`verify:verify`, {
    //   address: "0x8A791edF61BFd83C37CE8B2F72A6C388D5084cE4",
    //   constructorArguments: [
    //     "0xB654b4D63a3F9311F6647d91bC4f3FfE1E5d200A",
    //     "0x0b6a690285852A7C44cdEBD1F31B857Bc0803953",
    //     "0xb1d06c81fd47dd1abb1172feb369306a2746f220",
    //     "CoinOpSubscription",
    //     "COSU",
    //   ],
    // });
    await run(`verify:verify`, {
      address: "0x9CAC0A7944ba70Afd04AA62B532Cf041842E9A1a",
      constructorArguments: [
        "0xB85622D6afF34EC053C72D8DddCC45CE178eA0Ce",
        "CoinOpPreludePoints",
        "COPP",
        "0xb1d06c81fd47dd1abb1172feb369306a2746f220",
      ],
    });
    // await run(`verify:verify`, {
    //   address: "0x459fa8E27F943c2a37A0dFD18109686Cca6Ed0b7",
    //   constructorArguments: [
    //     {
    //       preRollCollection: "0x3f4adD04f00D392564cC6811227CE98c060e4c41",
    //       preRollNFT: "0xd6cF186a6D977E4785621C86918c7F3E50128053",
    //       coinOpPKPs: "0x0b6a690285852A7C44cdEBD1F31B857Bc0803953",
    //       coinOpPayment: "0xcA9360280Dac5960595A8D0cB3d73dEa1a0B9625",
    //       oracle: "0x31bbf0CD528aCb595E9F2dEdeb2f0771AeFD6368",
    //       accessControl: "0xB654b4D63a3F9311F6647d91bC4f3FfE1E5d200A",
    //       coinOpFulfillment: "0xF80D3044B28807f52EFB38e37b681eFF9D2867b9",
    //       customCompositeNFT: "0x28F4Fb4ac48eb3D69f4E63D5cDc78f9D357D2cD7",
    //       childFGO: "0x855a37e1d36e5665100419b403C9d8e7D84980BB",
    //       parentFGO: "0x2A7cb9f3bc5B16E02D63997c5c893626c9D546B9",
    //       pkpAddress: "0xb1d06c81fd47dd1abb1172feb369306a2746f220",
    //     },
    //     "COMA",
    //     "CoinOpMarket",
    //   ],
    // });

    // await run(`verify:verify`, {
    //   address: "0x566d63F1cC7f45Bfc9B2bdC785ffcc6F858F0997",
    //   contract: "contracts/TestToken.sol:TestToken"
    // });
  } catch (err: any) {
    console.error(err.message);
  }
};

main();
