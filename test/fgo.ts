import { ethers } from "hardhat";
import { BigNumber, Contract } from "ethers";
import chai from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
const { expect } = chai;

describe("FGO Contracts", function () {
  let admin: SignerWithAddress,
    nonAdmin: SignerWithAddress,
    fulfiller: SignerWithAddress,
    childFGO: Contract,
    parentFGO: Contract,
    coinOpOracle: Contract,
    accessControl: Contract,
    coinOpPayment: Contract,
    coinOpFulfillment: Contract,
    coinOpFGOEscrow: Contract,
    monaAddress: Contract,
    maticAddress: Contract,
    ethAddress: Contract,
    tetherAddress: Contract;

  beforeEach(async () => {
    [admin, nonAdmin, fulfiller] = await ethers.getSigners();

    const CoinOpAccessControl = await ethers.getContractFactory(
      "CoinOpAccessControl"
    );
    const CoinOpPayment = await ethers.getContractFactory("CoinOpPayment");
    const CoinOpOracle = await ethers.getContractFactory("CoinOpOracle");
    const ERC20 = await ethers.getContractFactory("TestToken");
    const CoinOpFulfillment = await ethers.getContractFactory(
      "CoinOpFulfillment"
    );
    const ChildFGO = await ethers.getContractFactory("CoinOpChildFGO");
    const ParentFGO = await ethers.getContractFactory("CoinOpParentFGO");
    const CoinOpFGOEscrow = await ethers.getContractFactory("CoinOpFGOEscrow");

    monaAddress = await ERC20.connect(admin).deploy();
    maticAddress = await ERC20.connect(admin).deploy();
    ethAddress = await ERC20.connect(admin).deploy();
    tetherAddress = await ERC20.connect(admin).deploy();

    accessControl = await CoinOpAccessControl.deploy(
      "CoinOpAccessControl",
      "COAC"
    );
    coinOpPayment = await CoinOpPayment.deploy(
      accessControl.address,
      "CoinOpPayment",
      "COPA"
    );
    coinOpFulfillment = await CoinOpFulfillment.deploy(
      accessControl.address,
      "CoinOpFulfillment",
      "COFU"
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

    childFGO = await ChildFGO.deploy(
      "CoinOpChildFGO",
      "COCFGO",
      accessControl.address
    );

    parentFGO = await ParentFGO.deploy(
      childFGO.address,
      coinOpPayment.address,
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

  xdescribe("Parent FGO", async () => {
    beforeEach(async () => {
      await parentFGO.mintFGO(
        "parentURI",
        "hoodie",
        ["childuri1", "childuri2", "childuri3"],
        100,
        [20, 30, 50],
        1
      );
    });

    describe("mint a child and parent", () => {
      it("updates parent total supply correctly", async () => {
        expect(await parentFGO.getTotalSupply()).to.deep.equal(
          BigNumber.from("1")
        );
      });
      it("updates child total supply correctly", async () => {
        expect(await childFGO.getTokenPointer()).to.deep.equal(
          BigNumber.from("3")
        );
      });
      it("sets parent token properties correctly", async () => {
        expect(await parentFGO.getParentPrintType(1)).to.equal("hoodie");
        expect(await parentFGO.getParentPrice(1)).to.deep.equal(
          BigNumber.from("100")
        );
        expect(await parentFGO.getParentFulfillerId(1)).to.deep.equal(
          BigNumber.from("1")
        );
        expect(await parentFGO.getParentCreator(1)).to.equal(admin.address);
        expect(await parentFGO.getParentChildTokens(1)).to.deep.equal([
          BigNumber.from("1"),
          BigNumber.from("2"),
          BigNumber.from("3"),
        ]);
        expect(await parentFGO.tokenURI(1)).to.equal("parentURI");
      });
      it("sets child token properties correctly", async () => {
        expect(await childFGO.getChildTokenParentId(1)).to.deep.equal(
          BigNumber.from("1")
        );
        expect(await childFGO.getChildTokenParentId(2)).to.deep.equal(
          BigNumber.from("1")
        );
        expect(await childFGO.getChildTokenParentId(3)).to.deep.equal(
          BigNumber.from("1")
        );

        expect(await childFGO.getChildPrice(1)).to.deep.equal(
          BigNumber.from("20")
        );
        expect(await childFGO.getChildPrice(2)).to.deep.equal(
          BigNumber.from("30")
        );
        expect(await childFGO.getChildPrice(3)).to.deep.equal(
          BigNumber.from("50")
        );

        expect(await childFGO.getChildCreator(1)).to.equal(admin.address);
        expect(await childFGO.getChildCreator(2)).to.equal(admin.address);
        expect(await childFGO.getChildCreator(3)).to.equal(admin.address);

        expect(await childFGO.getChildFulfillerId(1)).to.deep.equal(
          BigNumber.from("1")
        );
        expect(await childFGO.getChildFulfillerId(2)).to.deep.equal(
          BigNumber.from("1")
        );
        expect(await childFGO.getChildFulfillerId(3)).to.deep.equal(
          BigNumber.from("1")
        );

        expect(await childFGO.getChildTokenAmount(1)).to.deep.equal(
          BigNumber.from("1")
        );
        expect(await childFGO.getChildTokenAmount(2)).to.deep.equal(
          BigNumber.from("1")
        );
        expect(await childFGO.getChildTokenAmount(3)).to.deep.equal(
          BigNumber.from("1")
        );

        expect(await childFGO.getChildTokenURI(1)).to.equal("childuri1");
        expect(await childFGO.getChildTokenURI(2)).to.equal("childuri2");
        expect(await childFGO.getChildTokenURI(3)).to.equal("childuri3");

        expect(await childFGO.uri(1)).to.equal("childuri1");
        expect(await childFGO.uri(2)).to.equal("childuri2");
        expect(await childFGO.uri(3)).to.equal("childuri3");
      });

      it("it returns child token exists", async () => {
        expect(await childFGO.tokenExists(1)).to.be.true;
        expect(await childFGO.tokenExists(2)).to.be.true;
        expect(await childFGO.tokenExists(3)).to.be.true;
        expect(await childFGO.tokenExists(4)).to.be.false;
      });
    });

    describe("sends tokens to escrow", () => {
      it("child is owned by escrow", async () => {
        expect(
          await childFGO.balanceOf(coinOpFGOEscrow.address, 1)
        ).to.deep.equal(BigNumber.from("1"));

        expect(
          await childFGO.balanceOf(coinOpFGOEscrow.address, 2)
        ).to.deep.equal(BigNumber.from("1"));
        expect(
          await childFGO.balanceOf(coinOpFGOEscrow.address, 3)
        ).to.deep.equal(BigNumber.from("1"));

        expect(await coinOpFGOEscrow.getChildDeposited(1)).to.be.true;
        expect(await coinOpFGOEscrow.getChildDeposited(2)).to.be.true;
        expect(await coinOpFGOEscrow.getChildDeposited(3)).to.be.true;
      });
      it("parent is owned by escrow", async () => {
        expect(await parentFGO.ownerOf(1)).to.equal(coinOpFGOEscrow.address);
        expect(await coinOpFGOEscrow.getParentDeposited(1)).to.be.true;
      });
    });

    describe("reject on mint", () => {
      it("rejects if non admin", async () => {
        try {
          await parentFGO
            .connect(nonAdmin)
            .mintFGO(
              "parentURI",
              "hoodie",
              ["childuri1", "childuri2", "childuri3"],
              100,
              [20, 30, 50],
              1
            );
        } catch (err: any) {
          expect(err.message).to.includes(
            "CoinOpAccessControl: Only admin can perform this action"
          );
        }
      });
      it("rejects if fulfiller doesnt exist", async () => {
        try {
          await parentFGO.mintFGO(
            "parentURI",
            "hoodie",
            ["childuri1", "childuri2", "childuri3"],
            100,
            [20, 30, 50],
            2
          );
        } catch (err: any) {
          expect(err.message).to.includes(
            "CoinOpFulfillment: Fulfiller Id is not valid."
          );
        }
      });
      it("rejects if lengths aren't the same", async () => {
        try {
          await parentFGO.mintFGO(
            "parentURI",
            "hoodie",
            ["childuri1", "childuri3"],
            100,
            [20, 30, 50],
            2
          );
        } catch (err: any) {
          expect(err.message).to.includes(
            "CoinOpParentFGO: Prices and URIs Tokens must be the same length."
          );
        }
      });
    });

    describe("burns a parent", () => {
      beforeEach(async () => {
        await parentFGO.mintFGO(
          "parentURI",
          "hoodie",
          ["childuri1", "childuri2", "childuri3"],
          100,
          [20, 30, 50],
          1
        );
        await coinOpFGOEscrow.releaseParent(2);
      });
      it("it burns a parent and removes it from children", async () => {
        try {
          await parentFGO.ownerOf(2);
        } catch (err: any) {
          expect(err.message).to.include("ERC721: invalid token ID");
        }
        expect(await childFGO.getChildTokenParentId(4)).to.deep.equal(
          BigNumber.from("0")
        );
        expect(await childFGO.getChildTokenParentId(5)).to.deep.equal(
          BigNumber.from("0")
        );
        expect(await childFGO.getChildTokenParentId(6)).to.deep.equal(
          BigNumber.from("0")
        );
      });
      it("rejects burn if token not in escrow", async () => {
        try {
          await coinOpFGOEscrow.releaseParent(10);
        } catch (err: any) {
          expect(err.message).to.include(
            "CoinOpFGOEscrow: Token must be in escrow"
          );
        }
      });
      it("only escrow can set the new parent ids", async () => {
        try {
          await childFGO.setParentId(1, 0);
        } catch (err: any) {
          expect(err.message).to.include(
            "CoinOpAccessControl: Only the Escrow contract can perform this action"
          );
        }
      });
      it("only the escrow can burn", async () => {
        try {
          await parentFGO.burn(3);
        } catch (err: any) {
          expect(err.message).to.include(
            "CoinOpAccessControl: Only the Escrow contract can perform this action"
          );
        }
      });
      it("correctly mints again after burn", async () => {
        await parentFGO.mintFGO(
          "parentURI",
          "hoodie",
          ["childuri1", "childuri2"],
          100,
          [20, 30],
          1
        );

        expect(await parentFGO.getTotalSupply()).to.deep.equal(
          BigNumber.from("3")
        );
        expect(await childFGO.getTokenPointer()).to.deep.equal(
          BigNumber.from("8")
        );
      });
    });

    describe("updates all contracts", () => {
      let newChildFGO: Contract,
        newAccessControl: Contract,
        newCoinOpPayment: Contract,
        newCoinOpFulfillment: Contract,
        newCoinOpFGOEscrow: Contract;

      beforeEach(async () => {
        const CoinOpAccessControl = await ethers.getContractFactory(
          "CoinOpAccessControl"
        );
        const CoinOpPayment = await ethers.getContractFactory("CoinOpPayment");
        const CoinOpFulfillment = await ethers.getContractFactory(
          "CoinOpFulfillment"
        );
        const ChildFGO = await ethers.getContractFactory("CoinOpChildFGO");
        const CoinOpFGOEscrow = await ethers.getContractFactory(
          "CoinOpFGOEscrow"
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

        newChildFGO = await ChildFGO.deploy(
          "CoinOpChildFGO",
          "COCFGO",
          accessControl.address
        );

        newCoinOpFGOEscrow = await CoinOpFGOEscrow.deploy(
          parentFGO.address,
          childFGO.address,
          accessControl.address,
          "COEFGO",
          "CoinOpFGOEscrow"
        );
      });
      it("updates access control", async () => {
        await parentFGO.updateAccessControl(newAccessControl.address);
        expect(await parentFGO.getAccessControl()).to.equal(
          newAccessControl.address
        );
      });
      it("updates escrow", async () => {
        await parentFGO.setFGOEscrow(newCoinOpFGOEscrow.address);
        expect(await parentFGO.getFGOEscrow()).to.equal(
          newCoinOpFGOEscrow.address
        );
      });
      it("updates child", async () => {
        await parentFGO.updateChildFGO(newChildFGO.address);
        expect(await parentFGO.getFGOChild()).to.equal(newChildFGO.address);
      });
      it("updates fulfillment", async () => {
        await parentFGO.updateFulfillment(newCoinOpFulfillment.address);
        expect(await parentFGO.getFulfiller()).to.equal(
          newCoinOpFulfillment.address
        );
      });
      it("updates payment", async () => {
        await parentFGO.updatePayment(newCoinOpPayment.address);
        expect(await parentFGO.getPayment()).to.equal(newCoinOpPayment.address);
      });
      it("only admin can update contracts", async () => {
        try {
          await parentFGO
            .connect(nonAdmin)
            .updateFulfillment(coinOpFulfillment.address);
        } catch (err: any) {
          expect(err.message).to.include(
            "CoinOpAccessControl: Only admin can perform this action"
          );
        }
        try {
          await parentFGO
            .connect(nonAdmin)
            .updatePayment(coinOpPayment.address);
        } catch (err: any) {
          expect(err.message).to.include(
            "CoinOpAccessControl: Only admin can perform this action"
          );
        }

        try {
          await parentFGO
            .connect(nonAdmin)
            .updateAccessControl(accessControl.address);
        } catch (err: any) {
          expect(err.message).to.include(
            "CoinOpAccessControl: Only admin can perform this action"
          );
        }

        try {
          await parentFGO.connect(nonAdmin).updateChildFGO(parentFGO.address);
        } catch (err: any) {
          expect(err.message).to.include(
            "CoinOpAccessControl: Only admin can perform this action"
          );
        }

        try {
          await parentFGO
            .connect(nonAdmin)
            .setFGOEscrow(coinOpFGOEscrow.address);
        } catch (err: any) {
          expect(err.message).to.include(
            "CoinOpAccessControl: Only admin can perform this action"
          );
        }
      });
    });

    describe("emits all events", () => {
      it("emits event on mint", async () => {
        const tx = await parentFGO.mintFGO(
          "parentURI",
          "hoodie",
          ["childuri1", "childuri2", "childuri3"],
          100,
          [20, 30, 50],
          1
        );
        const receipt = await tx.wait();
        const event = receipt.events.find(
          (event: any) => event.event === "FGOTemplateCreated"
        );
        const eventData = await event.args;

        expect(eventData.parentTokenId).to.deep.equal(BigNumber.from("2"));
        expect(eventData.parentURI).to.equal("parentURI");
        expect(eventData.childTokenIds).to.deep.equal([
          BigNumber.from("4"),
          BigNumber.from("5"),
          BigNumber.from("6"),
        ]);
        expect(eventData.childTokenURIs).to.deep.equal([
          "childuri1",
          "childuri2",
          "childuri3",
        ]);
      });

      it("emits event on burn", async () => {
        const tx = await coinOpFGOEscrow.releaseParent(1);
        const receipt = await tx.wait();
        const event = receipt.events.find(
          (event: any) => event.event === "ParentReleased"
        );
        const eventData = await event.args;
        expect(eventData.parentTokenId).to.deep.equal(BigNumber.from("1"));
      });
    });
  });

  xdescribe("Child FGO", async () => {
    describe("mints a child token", () => {
      it("only the parent can mint", async () => {});
      it("only parent or escrow can set the parent id", async () => {});
    });

    describe("burns a child", () => {
      it("it burns a child and removes it from parent", async () => {});
      it("only the parent can set the new child ids", async () => {});
      it("rejects burn if token not in escrow", async () => {});
      it("only the escrow can burn", async () => {});
      it("correctly mints again after burn", async () => {});
    });

    describe("updates all contracts", () => {
      it("updates access control", async () => {});
      it("updates escrow", async () => {});
      it("updates parent", async () => {});
      it("only admin can update contracts", async () => {});
    });

    describe("emits all events", () => {});
  });
});
