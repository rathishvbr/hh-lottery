const {network, ethers} = require("hardhat");
const {developmentChains} = require("../helper-hardhat-config");

const BASE_FEE = ethers.utils.parseEther("0.25"); // 0.25 is the premium. It goes to the owner of the contract.
const GAS_PRICE_LINK = 1e9; // link per gas, 1e9 is the price of the gas
const WEI_PER_UNIT_LINK = ethers.utils.parseEther("0.000000000000000001"); // 0.000000000000000001 is the price of the link

module.exports = async ({getNamedAccounts, deployments}) => {
    const {deploy, log} = deployments;
    const {deployer} = await getNamedAccounts();

    const chainName = network.name;

    if (developmentChains.includes(chainName)) {
        log("Local network detected! Deploying mocks...");
        // Deploy a mock VRFCoordinatorV2_5
        await deploy("VRFCoordinatorV2_5Mock", {
            from: deployer,
            log: true,
            args: [
                BASE_FEE,
                GAS_PRICE_LINK,
                WEI_PER_UNIT_LINK,
            ],
        });
        log("Mocks deployed!");
        log("--------------------------------");
    }

}

module.exports.tags = ["all", "mocks"];