const { run } = require("hardhat")

async function main() {
    const raffleAddress = "YOUR_RAFFLE_CONTRACT_ADDRESS" // Replace with your deployed contract address
    const vrfCoordinator = "YOUR_VRF_COORDINATOR_ADDRESS" // Replace with your VRF coordinator address
    const entranceFee = ethers.utils.parseEther("0.01") // Replace with your entrance fee
    const keyHash = "YOUR_KEY_HASH" // Replace with your key hash
    const subscriptionId = "YOUR_SUBSCRIPTION_ID" // Replace with your subscription ID
    const callbackGasLimit = 500000 // Replace with your callback gas limit
    const interval = 30 // Replace with your interval in seconds

    console.log("Verifying contract...")
    try {
        await run("verify:verify", {
            address: raffleAddress,
            constructorArguments: [
                vrfCoordinator,
                entranceFee,
                keyHash,
                subscriptionId,
                callbackGasLimit,
                interval,
            ],
        })
    } catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already verified!")
        } else {
            console.log(e)
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    }) 