require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");
require("@nomiclabs/hardhat-web3");


/** @type import('hardhat/config').HardhatUserConfig */
task("accounts", "Prints the list of accounts", async (Args, hre, web3) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});
const BSCSCAN_API_KEY = "W822W2CBW7D7TT4JMS296KRCDB8HTHNJV3";

const PRIVATE_KEY =
  "";

module.exports = {
  solidity: {
    compilers:[
      {
       version: "0.8.13"
      },
      {
        version: "0.4.18"
      }
    ]
  },
  networks: {
    bsctest: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      accounts: [PRIVATE_KEY],
      timeout: 200000,
      confirmations: 2,
      gas: 21000000
    }
  },
  
  
  etherscan: {
    apiKey: {
      bscTestnet: BSCSCAN_API_KEY
    }
  },

  mocha: {
    timeout: 10000000000
  }
};
