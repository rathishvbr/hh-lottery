const {network, ethers} = require("hardhat");
const {developmentChains, networkConfig} = require("../helper-hardhat-config");

const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("12");

module.exports = async ({getNamedAccounts, deployments}) => {
    console.log("Deploying Raffle...");
    const {deploy, log, get} = deployments;
    const {deployer} = await getNamedAccounts();
    let vrfCoordinatorAddress;
    let subscriptionId;
    const chainName = network.name;
    const chainId = network.config.chainId;

    if (developmentChains.includes(chainName)) {
        log("Local network detected! Using existing mocks...");
        const vrfCoordinatorMock = await get("VRFCoordinatorV2_5Mock");
        vrfCoordinatorAddress = vrfCoordinatorMock.address;
        const vrfCoordinatorV2_5Mock = await ethers.getContractAt("VRFCoordinatorV2_5Mock", vrfCoordinatorAddress);
        const transactionResponse = await vrfCoordinatorV2_5Mock.createSubscription();
        const transactionReceipt = await transactionResponse.wait(1);
        subscriptionId = transactionReceipt.events[0].args.subId;
        await vrfCoordinatorV2_5Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT);
        log("Subscription ID: ", subscriptionId);
    } else {
        vrfCoordinatorAddress = networkConfig[chainId]["vrfCoordinator"];
        subscriptionId = networkConfig[chainId]["subscriptionId"];
        log("Subscription ID: ", subscriptionId);
    }

    let entranceFee = networkConfig[chainId]["entranceFee"];
    let gasLane = networkConfig[chainId]["gasLane"];
    let callbackGasLimit = networkConfig[chainId]["callbackGasLimit"];
    let interval = networkConfig[chainId]["interval"];

    let args = [
        vrfCoordinatorAddress,
        entranceFee,
        gasLane,
        subscriptionId,
        callbackGasLimit,
        interval,
    ];
    log("Deploying Raffle with args: ", args);
    await deploy("Raffle", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    // // Verify the contract
    // if (!developmentChains.includes(chainName)) {
    //     log("Verifying contract...");
    //     await verify(raffle.address, args);
    // }
}

module.exports.tags = ["all", "raffle"];