import "dotenv/config";
import {HardhatUserConfig} from "hardhat/types";

import "@nomicfoundation/hardhat-chai-matchers";
import "@nomicfoundation/hardhat-ethers";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

import "hardhat-deploy";
import "hardhat-deploy-ethers";
import "hardhat-deploy-tenderly";

import {node_url, accounts, addForkConfiguration} from "./utils/network";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.6.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.8.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  namedAccounts: {
    deployer: 0,
    owner: {
      default: 0,
      mainnet: "0x145c79A1F0e1Ad5ad7fC8d99548a02A07B24F8FD",
      arbitrum: "0x9d82033BB36217B44567edC635bE926f74D1b76f",
    },
    faucetSuper: {
      default: "0x3fA8F8958b90D370291f9BBdDD617BB3E4f98a21",
    },
  },
  networks: addForkConfiguration({
    hardhat: {
      live: false,
      initialBaseFeePerGas: 0, // to fix : https://github.com/sc-forks/solidity-coverage/issues/652, see https://github.com/sc-forks/solidity-coverage/issues/652#issuecomment-896330136
    },
    localhost: {
      live: false,
      url: node_url("localhost"),
      accounts: accounts(),
    },
    staging: {
      url: node_url("goerli"),
      accounts: accounts("goerli"),
    },
    production: {
      url: node_url("mainnet"),
      accounts: accounts("mainnet"),
    },
    mainnet: {
      url: node_url("mainnet"),
      accounts: accounts("mainnet"),
      deploy: ["upgrade/"],
      saveDeployments: true,
    },
    sepolia: {
      url: node_url("sepolia"),
      accounts: accounts("sepolia"),
      deploy: ["upgrade/"],
    },
    goerli: {
      url: node_url("goerli"),
      accounts: accounts("goerli"),
    },
    truffle: {
      url: "http://localhost:24012/rpc",
      timeout: 10000000,
    },
    arbitrum: {
      url: node_url("arbitrum"),
      accounts: accounts(),
      deploy: ["upgrade/"],
    },
  }),
  paths: {
    sources: "src",
  },
  gasReporter: {
    currency: "USD",
    gasPrice: 100,
    enabled: process.env.REPORT_GAS ? true : false,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    maxMethodDiff: 10,
  },
  mocha: {
    timeout: 1000000,
  },
  external: process.env.HARDHAT_FORK
    ? {
        deployments: {
          // process.env.HARDHAT_FORK will specify the network that the fork is made from.
          // these lines allow it to fetch the deployments from the network being forked from both for node and deploy task
          hardhat: ["deployments/" + process.env.HARDHAT_FORK],
          localhost: ["deployments/" + process.env.HARDHAT_FORK],
        },
      }
    : undefined,

  tenderly: {
    project: "template-ethereum-contracts",
    username: process.env.TENDERLY_USERNAME as string,
  },
};

export default config;
