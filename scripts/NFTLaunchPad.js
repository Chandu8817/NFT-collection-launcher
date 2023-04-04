const hre = require("hardhat");
const { ethers, upgrades, network } = require("hardhat");

async function main() {
  const accounts = await ethers.getSigners();
  [user, add1, add2, add3, add4, _] = accounts;
  signers = await ethers.getSigners();

  const NFTLaunchPad = await hre.ethers.getContractFactory("NFTLaunchPad");
  const nftLaunchPad = await upgrades.deployProxy(
    NFTLaunchPad,
    [200, add1.address, add2.address],
    {
      initializer: "initialize",
    }
  );
  await nftLaunchPad.deployed();
  console.log("NFTLaunchPad deployed to", nftLaunchPad.address);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
