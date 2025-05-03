require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
require("solidity-coverage")
require("hardhat-gas-reporter")
require("hardhat-contract-sizer")
require("dotenv").config()

const { PRIVATE_KEY, SEPOLIA_URL, ETHERSCAN_API_KEY, COINMARKETCAP_API_KEY, REPORT_GAS } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        compilers: [
            {
                version: "0.8.7",
            },
            {
                version: "0.8.19",
            },
        ],
    },
    gasReporter: {
        enabled: REPORT_GAS ? true : false,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
    },
    etherscan: {
        // yarn hardhat verify --network <NETWORK> <CONTRACT_ADDRESS> <CONSTRUCTOR_PARAMETERS>
        apiKey: {
            sepolia: ETHERSCAN_API_KEY,
        },
    },
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            blockConfirmations: 1,
        },
        sepolia: {
            chainId: 11155111,
            blockConfirmations: 6,
            url: SEPOLIA_URL,
            accounts: [PRIVATE_KEY],
        },
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        player: {
            default: 1,
        },
    }
}
