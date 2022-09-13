import dotenv from "dotenv";
dotenv.config();

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "hardhat-deploy-ethers";
import "hardhat-deploy";
import "hardhat-contract-sizer";

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
 const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
  },
  networks: {

    hardhat: {
      accounts: [
        {
          privateKey: process.env.LOCAL_PERSISTENT_PK || "",
          balance: '10000000000000000000000',
        },
      ],
    },
    

    mumbai: {
      url: process.env.MUMBAI_RPC_URL || "",
      accounts: {
        mnemonic: process.env.TESTNET_MNENONIC,
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 20,
        passphrase: "",
      },
      chainId: 80001,
    }
  },
  solidity: {
    compilers: [
      {
        version: "0.8.4",
        settings: {
          optimizer: {
            enabled: false,
            runs: 50,
          },
        },
      }
    ],
  },
};
export default config;