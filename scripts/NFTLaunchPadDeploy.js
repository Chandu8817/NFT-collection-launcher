const hre = require("hardhat");
const { ethers, upgrades, network } = require("hardhat");

async function main() {
  const accounts = await ethers.getSigners();
  [user, add1, add2, add3, add4, _] = accounts;
  signers = await ethers.getSigners();

  const NFTLaunchPad = await hre.ethers.getContractFactory("NFTLaunchPad");
  const nftLaunchpad = await upgrades.deployProxy(
    NFTLaunchPad,
    [
      200,
      "0xEaa1378ceEE1283f4a68530B71653405Aec57673",
      "0x678fee76722fcDB047543fB7Fb92821e6E19F8db",
    ],
    {
      initializer: "initialize",
    }
  );
  await nftLaunchpad.deployed();
  console.log("NFTLaunchPad deployed to", nftLaunchpad.address);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
