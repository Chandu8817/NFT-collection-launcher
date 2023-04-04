const { expect } = require("chai");
const { ethers, web3 } = require("hardhat");
const hre = require("hardhat");
require("@nomiclabs/hardhat-web3");

let nftCollection;
let quantity = 10;
let privateKey = "";

describe("NFTCollection Contract", () => {
  before(async () => {
    accounts = await hre.ethers.getSigners();
    [user, add1, add2, add3, add4, add5, _] = accounts;

    //Deployed WBNB
    WBNB = await hre.ethers.getContractFactory("WBNB");
    wbnb = await WBNB.deploy();
    await wbnb.deployed();

    console.log("WBNB deployed to:", wbnb.address);

    //Deployed NFTCollection
    NFTCollection = await hre.ethers.getContractFactory("NFTCollection");
    nftCollection = await NFTCollection.deploy(
      "MyNFT",
      "NFT",
      100,
      "hello",
      "json",
      100,
      add1.address,
      10,
      add2.address,
      wbnb.address
    );
    await nftCollection.deployed();

    console.log("NFT Collection deployed to:", nftCollection.address);
  });

  describe("NFTCollection signature", () => {
    it("Should check user is whitelisted", async () => {
      //Get current block.timestamp
      let blockNumber = await ethers.provider.getBlockNumber();
      let block = await ethers.provider.getBlock(blockNumber);
      let nonce = 0;
      let message = ethers.utils.solidityPack(
        ["address", "uint256", "uint256", "bool"],
        [add3.address, nonce, block.timestamp - 200, true]
      );

      console.log("Message is:", message);
      let messageHash = ethers.utils.keccak256(message);
      let sign = web3.eth.accounts.sign(messageHash, add4.address);
      // console.log("Signature is:", sign);
      // let verifySign = web3.eth.accounts.recover(messageHash, sign.signature);
      // console.log("Verify Signature is:", verifySign);
      let oldBalance = await nftCollection.balanceOf(add3.address);
      console.log(
        "Old balance is",
        await nftCollection.balanceOf(add3.address)
      );
      await nftCollection
        .connect(add3)
        .mint(quantity, nonce, block.timestamp - 200, sign.signature, true, {
          from: add3.address,
          value: 4000,
        });

      expect(await nftCollection.ownerOf(4)).to.be.equal(add3.address);
      expect(await nftCollection.balanceOf(add3.address)).to.be.equal(
        oldBalance.add(quantity)
      );
      console.log(
        "New balance is",
        await nftCollection.balanceOf(add3.address)
      );
    });

  //   it("Should check user is not whitelisted", async () => {
  //     console.log("Balance", await nftCollection.balanceOf(add3.address));
  //     //Get current block.timestamp
  //     let blockNumber = await ethers.provider.getBlockNumber();
  //     let block = await ethers.provider.getBlock(blockNumber);
  //     //let quantity = 5;
  //     let nonce = 1;
  //     let message = ethers.utils.solidityPack(
  //       ["address", "uint256", "uint256", "bool"],
  //       [add3.address, nonce, block.timestamp - 200, false]
  //     );

  //     console.log("Message is:", message);

  //     let messageHash = ethers.utils.keccak256(message);
  //     let sign = web3.eth.accounts.sign(messageHash, privateKey);
  //     // let verifySign = web3.eth.accounts.recover(messageHash, sign.signature);
  //     let oldBalance = await nftCollection.balanceOf(add3.address);
  //     console.log("Old balance is", oldBalance);

  //     await nftCollection
  //       .connect(add3)
  //       .mint(quantity, nonce, block.timestamp - 200, sign.signature, false, {
  //         from: add3.address,
  //         value: 6000,
  //       });
  //     expect(await nftCollection.ownerOf(3)).to.be.equal(add3.address);
  //     expect(await nftCollection.balanceOf(add3.address)).to.be.equal(
  //       oldBalance.add(quantity)
  //     );
  //     console.log(
  //       "New balance is",
  //       await nftCollection.balanceOf(add3.address)
  //     );
  //   });

  //   it("Should check that max supply is less", async () => {
  //     let blockNumber = await ethers.provider.getBlockNumber();
  //     let block = await ethers.provider.getBlock(blockNumber);
  //     let nonce = 1;
  //     let maxSupply = 100;
  //     let message = ethers.utils.solidityPack(
  //       ["address", "uint256", "uint256", "bool"],
  //       [add3.address, nonce, block.timestamp - 200, false]
  //     );
  //     let messageHash = ethers.utils.keccak256(message);
  //     let sign = web3.eth.accounts.sign(messageHash, privateKey);
  //     await expect(
  //       nftCollection
  //         .connect(add3)
  //         .mint(101, nonce, block.timestamp - 200, sign.signature, false)
  //     ).to.be.revertedWith(
  //       "NFTCollection: Quantity should be less than Max supply!"
  //     );
  //     //console.log("Total:", await nftCollection.totalSupply());
  //   });

  //   it("Nonce already proceed", async () => {
  //     let blockNumber = await ethers.provider.getBlockNumber();
  //     let block = await ethers.provider.getBlock(blockNumber);
  //     let quantity = 10;
  //     let nonce = 0;
  //     let message = ethers.utils.solidityPack(
  //       ["address", "uint256", "uint256", "bool"],
  //       [add3.address, nonce, block.timestamp - 200, false]
  //     );
  //     let messageHash = ethers.utils.keccak256(message);
  //     let sign = web3.eth.accounts.sign(messageHash, privateKey);
  //     await expect(
  //       nftCollection
  //         .connect(add3)
  //         .mint(quantity, nonce, block.timestamp - 200, sign.signature, false)
  //     ).to.be.revertedWith("NFTCollection: Nonce already proceed!");
  //   });

  //   it("Should check mint time", async () => {
  //     let blockNumber = await ethers.provider.getBlockNumber();
  //     let block = await ethers.provider.getBlock(blockNumber);
  //     let nonce = 2;
  //     let message = ethers.utils.solidityPack(
  //       ["address", "uint256", "uint256", "bool"],
  //       [add3.address, nonce, block.timestamp - 200, false]
  //     );
  //     let messageHash = ethers.utils.keccak256(message);
  //     let sign = web3.eth.accounts.sign(messageHash, privateKey);
  //     // let verifySign=  web3.eth.accounts.recover(messageHash,sign.signature);
  //     await expect(
  //       nftCollection
  //         .connect(add3)
  //         .mint(quantity, nonce, block.timestamp + 200, sign.signature, false)
  //     ).to.be.revertedWith(
  //       "NFTCollection: Mint time should be less than current time"
  //     );
  //   });

  //   it("Should check signature verification", async () => {
  //     let blockNumber = await ethers.provider.getBlockNumber();
  //     let block = await ethers.provider.getBlock(blockNumber);
  //     let nonce = 2;
  //     let message = ethers.utils.solidityPack(
  //       ["address", "uint256", "uint256", "bool"],
  //       [add3.address, nonce, block.timestamp - 200, false]
  //     );
  //     let messageHash = ethers.utils.keccak256(message);
  //     let sign = web3.eth.sign(messageHash, add5.address);
  //     await expect(
  //       nftCollection
  //         .connect(add3)
  //         .mint(quantity, nonce, block.timestamp - 200, sign, false))
  //         .to.be.revertedWith("NFTCollection: Verification failed")
  //   });

  //   it("Should check amount to mint", async () => {
  //     let blockNumber = await ethers.provider.getBlockNumber();
  //     let block = await ethers.provider.getBlock(blockNumber);
  //     let nonce = 3;
  //     let message = ethers.utils.solidityPack(
  //       ["address", "uint256", "uint256", "bool"],
  //       [add3.address, nonce, block.timestamp - 200, false]
  //     );
  //     let messageHash = ethers.utils.keccak256(message);
  //     let sign = web3.eth.accounts.sign(messageHash, privateKey);
  //     let whitelistedFee = 500;
  //     let amount = whitelistedFee * quantity;
  //     console.log("Amount", amount);
  //     await expect(
  //       nftCollection
  //         .connect(add3)
  //         .mint(quantity, nonce, block.timestamp - 200, sign.signature, false, {
  //           from: add3.address,
  //           value: 2000,
  //         })
  //     ).to.be.revertedWith("NFTCollection: Mint amount is insufficient.");
  //   });

  //   it("Should check whitelist amount to mint", async () => {
  //     let blockNumber = await ethers.provider.getBlockNumber();
  //     let block = await ethers.provider.getBlock(blockNumber);
  //     let nonce = 3;
  //     let message = ethers.utils.solidityPack(
  //       ["address", "uint256", "uint256", "bool"],
  //       [add3.address, nonce, block.timestamp - 200, true]
  //     );
  //     let messageHash = ethers.utils.keccak256(message);
  //     let sign = web3.eth.accounts.sign(messageHash, privateKey);
  //     let whitelistedFee = 300;
  //     let amount = whitelistedFee * quantity;
  //     console.log("Amount", amount);
  //     await expect(
  //       nftCollection
  //         .connect(add3)
  //         .mint(quantity, nonce, block.timestamp - 200, sign.signature, true, {
  //           from: add3.address,
  //           value: 3000,
  //         })
  //     ).to.be.revertedWith(
  //       "NFTCollection: WhiteList mint amount is insufficient."
  //     );
  //   });
   });
});
