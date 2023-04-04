const { expect } = require("chai");
const { ethers, web3 } = require("hardhat");
const { upgrades } = require("hardhat");
require("@nomiclabs/hardhat-web3");

// let brokerage = 200,
//   brokerAddress,
//   name = "myNFT",
//   symbol = "NFT",
//   maxSupply = 100,
//   baseURI = "https://",
//   uriSuffix = ".json",
//   royalty = 20,
//   reciever;
let uintStruct = [100, 400, 600, 10, 200];
let stringStruct = ["collection", "colec", "baseURI", "contractURI"]

describe("NFTLaunchPad Contract", () => {
  before(async () => {
    accounts = await ethers.getSigners();
    [user, add1, add2, add3, add4, add5, _] = accounts;

    NFTCollection = await hre.ethers.getContractFactory("NFTCollection");
    nftCollection = await NFTCollection.deploy(
      uintStruct, user.address, stringStruct, 200, add1.address, add5.address);
    await nftCollection.deployed();
    console.log("NFTCollection deployed to", nftCollection.address);

    NFTLaunchPad = await hre.ethers.getContractFactory("NFTLaunchPad");
    nftLaunchPad = await upgrades.deployProxy(
      NFTLaunchPad,
      [200, add1.address, add5.address],
      {
        initializer: "initialize",
      }
    );
    await nftLaunchPad.deployed();
    console.log("NFTLaunchPad deployed to", nftLaunchPad.address);
  });

  describe("Create NFT LaunchPad", () => {
  //   it("Should check brokerage is set", async () => {
  //     expect(brokerage).to.be.equals(await nftLaunchPad.brokerage());
  //   });

  //   it("Should check broker address is set", async () => {
  //     brokerAddress = add1.address;
  //     expect(brokerAddress).to.be.equals(await nftLaunchPad.brokerAddress());
  //   });

    it("Should check NFT LaunchPad is created", async () => {
      let LaunchPad = await nftLaunchPad.createLaunchPad(
        uintStruct,
        stringStruct
      );
      receipt = await LaunchPad.wait();
        // for(const event of receipt.events){
        //   console.log("event:", event.args);
        // }
      expect(await receipt.events[2].args[0]).to.be.equals(user.address);
      expect(await receipt.events[2].event).to.be.equals("CreateLaunchpad");
      console.log("get collection: ", await nftLaunchPad.getCollections());
      // console.log("event: ", await receipt.events[2].event);
      //   console.log("Collection address: ", await receipt.events[2].args[1]);
      //   console.log("created collection: ", await nftLaunchPad.getCollections());
    });

    it("Should check new created collection", async () => {
      let NewCollection = receipt.events[2].args[1];
      let NFTCollection = await hre.ethers.getContractFactory("NFTCollection");
      nftCollection1 = NFTCollection.attach(NewCollection);
      console.log("NewLaunchPad: ", await nftCollection1.name());
      console.log("name: ", await nftCollection1.name());
    });

    it("Should check mint function", async () => {
      let blockNumber = await ethers.provider.getBlockNumber();
      let block = await ethers.provider.getBlock(blockNumber);
      let quantity = 10,
        nonce = 0;

      let message = ethers.utils.solidityPack(
        ["address", "uint256", "uint256", "bool"],
        [add2.address, 0, block.timestamp - 100, false]
      );
      let messageHash = ethers.utils.keccak256(message);
      let sign = web3.eth.sign(messageHash, add5.address);
      let oldBalance = await nftCollection1.balanceOf(add2.address);
      await nftCollection1
        .connect(add2)
        .mint(quantity, nonce, block.timestamp - 100, sign, false, {
          from: add2.address,
          value: 6000,
        });
        console.log("sign: ", sign);
      expect(await nftCollection1.balanceOf(add2.address)).to.be.equals(
        oldBalance.add(quantity)
      );
    });

  //   it("Should check brokerage", async () => {
  //     let blockNumber = await ethers.provider.getBlockNumber();
  //     let block = await ethers.provider.getBlock(blockNumber);
  //     let quantity = 10,
  //       nonce = 0;

  //     let message = ethers.utils.solidityPack(
  //       ["address", "uint256", "uint256", "bool"],
  //       [add2.address, 0, block.timestamp - 100, false]
  //     );
  //     let messageHash = ethers.utils.keccak256(message);
  //     let sign = web3.eth.accounts.sign(messageHash, privateKey);
  //     let oldBalance = await nftCollection1.balanceOf(add2.address);
  //     await nftCollection1
  //       .connect(add2)
  //       .mint(quantity, nonce, block.timestamp - 100, sign.signature, false, {
  //         from: add2.address,
  //         value: 6000,
  //       });
  //     expect(await nftCollection1.balanceOf(add2.address)).to.be.equals(
  //       oldBalance.add(quantity)
  //     );
  //   });



  //   it("Should call only if caller is owner", async () => {
  //     await expect(
  //       nftLaunchPad.connect(add2).setBrokerage(brokerage)
  //     ).to.be.revertedWith("Ownable: caller is not the owner");
  //   });

  //   it("Should call only if caller is owner", async () => {
  //     await expect(
  //       nftLaunchPad.connect(add2).setBroker(add1.address)
  //     ).to.be.revertedWith("Ownable: caller is not the owner");
  //   });
  });
});
