require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
require('dotenv').config()
require('solidity-coverage')

const KOVAN_RPM_URL = process.env.KOVAN_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const PRIVATE_KEY2 = process.env.PRIVATE_KEY2

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      //chainId: 1337
    },
    kovan: {
      url: KOVAN_RPM_URL,
      accounts: [PRIVATE_KEY, PRIVATE_KEY2]
    }
  },
  solidity: {
    compilers: [{version: "0.8.0"}, {version: "0.8.7"}, {version: "0.6.8"}, {version: "0.6.6"}, {version: "0.8.11"}, {version: "0.8.13"}],
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./social-auction-ui/src/artifacts"
  },
  mocha: {
    timeout: 300000
  }
};
