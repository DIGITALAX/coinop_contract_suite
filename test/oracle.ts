import { ethers } from "hardhat";
import { BigNumber, Contract } from "ethers";
import chai from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
const { expect } = chai;

xdescribe("Oracle Contract", function () {
  let admin: SignerWithAddress,
    nonAdmin: SignerWithAddress,
    accessControl: Contract,
    coinOpOracle: Contract,
    monaAddress: Contract,
    maticAddress: Contract,
    ethAddress: Contract,
    tetherAddress: Contract;

  beforeEach(async () => {
    [admin, nonAdmin] = await ethers.getSigners();

    const CoinOpAccessControl = await ethers.getContractFactory(
      "CoinOpAccessControl"
    );
    const CoinOpOracle = await ethers.getContractFactory("CoinOpOracle");
    const ERC20 = await ethers.getContractFactory("TestToken");

    monaAddress = await ERC20.connect(admin).deploy();
    maticAddress = await ERC20.connect(admin).deploy();
    ethAddress = await ERC20.connect(admin).deploy();
    tetherAddress = await ERC20.connect(admin).deploy();

    accessControl = await CoinOpAccessControl.deploy(
      "CoinOpAccessControl",
      "COAC"
    );
    coinOpOracle = await CoinOpOracle.deploy(
      accessControl.address,
      monaAddress.address,
      ethAddress.address,
      maticAddress.address,
      tetherAddress.address,
      "COOR",
      "CoinOpOracle"
    );
  });

  describe("set oracle amounts", () => {
    beforeEach(async () => {
      await coinOpOracle.setOraclePricesUSD(
        "250000000000000000000",
        "1100000000000000000000",
        "1500000000000000000",
        "1000000000000000000"
      );
    });
    it("correctly sets oracle values", async () => {
      expect(await coinOpOracle.getMonaPriceUSD()).to.deep.equal(
        BigNumber.from("250000000000000000000")
      );
      expect(await coinOpOracle.getEthPriceUSD()).to.deep.equal(
        BigNumber.from("1100000000000000000000")
      );
      expect(await coinOpOracle.getMaticPriceUSD()).to.deep.equal(
        BigNumber.from("1500000000000000000")
      );
      expect(await coinOpOracle.getTetherPriceUSD()).to.deep.equal(
        BigNumber.from("1000000000000000000")
      );
    });
    it("correctly sets oracle addresses", async () => {
      expect(await coinOpOracle.getTetherAddress()).to.equal(
        tetherAddress.address
      );
      expect(await coinOpOracle.getMonaAddress()).to.equal(monaAddress.address);
      expect(await coinOpOracle.getEthAddress()).to.equal(ethAddress.address);
      expect(await coinOpOracle.getMaticAddress()).to.equal(
        maticAddress.address
      );
    });
    it("only admin can set oracle values", async () => {
      try {
        await coinOpOracle
          .connect(nonAdmin)
          .setOraclePricesUSD(
            "250000000000000000000",
            "1100000000000000000000",
            "1500000000000000000",
            "1000000000000000000"
          );
      } catch (err: any) {
        expect(err.message).to.include(
          "CoinOpAccessControl: Only admin can perform this action"
        );
      }
    });

    it("only admin can set address values", async () => {
      try {
        await coinOpOracle
          .connect(nonAdmin)
          .setMonaAddress(monaAddress.address);
      } catch (err: any) {
        expect(err.message).to.include(
          "CoinOpAccessControl: Only admin can perform this action"
        );
      }

      try {
        await coinOpOracle
          .connect(nonAdmin)
          .setTetherAddress(tetherAddress.address);
      } catch (err: any) {
        expect(err.message).to.include(
          "CoinOpAccessControl: Only admin can perform this action"
        );
      }

      try {
        await coinOpOracle
          .connect(nonAdmin)
          .setMaticAddress(maticAddress.address);
      } catch (err: any) {
        expect(err.message).to.include(
          "CoinOpAccessControl: Only admin can perform this action"
        );
      }

      try {
        await coinOpOracle.connect(nonAdmin).setEthAddress(ethAddress.address);
      } catch (err: any) {
        expect(err.message).to.include(
          "CoinOpAccessControl: Only admin can perform this action"
        );
      }
    });
  });

  describe("update contracts", () => {
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
      await coinOpOracle.updateAccessControl(newAccessControl.address);
      expect(await coinOpOracle.getAccessControlContract()).to.equal(
        newAccessControl.address
      );
    });
    it("only admin can update access control", async () => {
      try {
        await coinOpOracle
          .connect(nonAdmin)
          .updateAccessControl(newAccessControl.address);
      } catch (err: any) {
        expect(err.message).to.include(
          "CoinOpAccessControl: Only admin can perform this action"
        );
      }
    });
  });

  describe("update oracle", () => {
    let newMonaAddress: Contract,
      newMaticAddress: Contract,
      newEthAddress: Contract,
      newTetherAddress: Contract;
    beforeEach(async () => {
      await coinOpOracle.setOraclePricesUSD(
        "350000000000000000000",
        "3100000000000000000000",
        "3500000000000000000",
        "3000000000000000000"
      );

      const ERC20 = await ethers.getContractFactory("TestToken");

      newMonaAddress = await ERC20.connect(admin).deploy();
      newMaticAddress = await ERC20.connect(admin).deploy();
      newEthAddress = await ERC20.connect(admin).deploy();
      newTetherAddress = await ERC20.connect(admin).deploy();
    });
    it("updates oracle values correctly", async () => {
      expect(await coinOpOracle.getMonaPriceUSD()).to.deep.equal(
        BigNumber.from("350000000000000000000")
      );
      expect(await coinOpOracle.getEthPriceUSD()).to.deep.equal(
        BigNumber.from("3100000000000000000000")
      );
      expect(await coinOpOracle.getMaticPriceUSD()).to.deep.equal(
        BigNumber.from("3500000000000000000")
      );
      expect(await coinOpOracle.getTetherPriceUSD()).to.deep.equal(
        BigNumber.from("3000000000000000000")
      );
    });
    it("updates oracle address correctly", async () => {
      await coinOpOracle.setTetherAddress(newTetherAddress.address);
      await coinOpOracle.setMonaAddress(newMonaAddress.address);
      await coinOpOracle.setEthAddress(newEthAddress.address);
      await coinOpOracle.setMaticAddress(newMaticAddress.address);

      expect(await coinOpOracle.getTetherAddress()).to.equal(
        newTetherAddress.address
      );
      expect(await coinOpOracle.getMonaAddress()).to.equal(newMonaAddress.address);
      expect(await coinOpOracle.getEthAddress()).to.equal(newEthAddress.address);
      expect(await coinOpOracle.getMaticAddress()).to.equal(
        newMaticAddress.address
      );
    });
  });

  describe("emits events", () => {
    it("emits access control update event", async () => {
      const CoinOpAccessControl = await ethers.getContractFactory(
        "CoinOpAccessControl"
      );

      const newAccessControl = await CoinOpAccessControl.deploy(
        "CoinOpAccessControl",
        "COAC"
      );
      const oldAccessControl = await coinOpOracle.getAccessControlContract();
      const tx = await coinOpOracle.updateAccessControl(
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
    it("emits oracle updated event", async () => {
      const tx = await coinOpOracle.setOraclePricesUSD(
        "350000000000000000000",
        "3100000000000000000000",
        "3500000000000000000",
        "3000000000000000000"
      );
      const receipt = await tx.wait();
      const event = receipt.events.find(
        (event: any) => event.event === "OracleUpdated"
      );
      const eventData = await event.args;
      expect(eventData.monaPrice).to.deep.equal(
        BigNumber.from("350000000000000000000")
      );
      expect(eventData.ethPrice).to.deep.equal(
        BigNumber.from("3100000000000000000000")
      );
      expect(eventData.maticPrice).to.deep.equal(
        BigNumber.from("3500000000000000000")
      );
      expect(eventData.tetherPrice).to.deep.equal(
        BigNumber.from("3000000000000000000")
      );
    });
  });
});
