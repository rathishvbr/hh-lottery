const { assert, expect } = require("chai")
const { getNamedAccounts, ethers, network, deployments } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle", function () {
          let raffle, vrfCoordinatorMock, raffleEntranceFee, deployer, interval, accounts;
          const chainId = network.config.chainId

          beforeEach(async function () {
              accounts = await ethers.getSigners()
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              const raffleDeployment = await deployments.get("Raffle")
              const vrfCoordinatorMockDeployment = await deployments.get("VRFCoordinatorV2_5Mock")
              const deployerSigner = await ethers.getSigner(deployer)
              raffle = await ethers.getContractAt(
                  "Raffle",
                  raffleDeployment.address,
                  deployerSigner
              )
              vrfCoordinatorMock = await ethers.getContractAt(
                  "VRFCoordinatorV2_5Mock",
                  vrfCoordinatorMockDeployment.address,
                  deployerSigner
              )
              raffleEntranceFee = await raffle.getEntranceFee()
              interval = await raffle.getInterval()
          })

          describe("constructor", function () {
              it("Initializes correctly", async function () {
                  const raffleState = await raffle.getRaffleState()
                  assert.equal(raffleState, 0)
                  assert.equal(interval, networkConfig[chainId].interval)
              })
          })

          describe("enterRaffle", function () {
              it("Reverts when not enough ETH is sent", async function () {
                  await expect(raffle.enterRaffle()).to.be.revertedWith(
                      "Raffle__NotEnoughEthEntered"
                  )
              })
              it("records players when they enter the raffle", async function () {
                  await raffle.enterRaffle({ value: raffleEntranceFee });
                  const firstPlayer = await raffle.getPlayer(0)
                  assert.equal(firstPlayer, deployer)
              })
              it("emits a raffle enter event", async function () {
                  await expect(raffle.enterRaffle({ value: raffleEntranceFee })).to.emit(
                      raffle,
                      "RaffleEnter"
                  )
              })
              it("does not allow entrance when raffle is calculating", async function () {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  //   https://hardhat.org/hardhat-network/docs/reference#evm_increasetime
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
                  await raffle.performUpkeep([])
                  const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([])
                  assert(!upkeepNeeded)
              })
          })

          describe("checkUpkeep", function () {
            it("returns false if people haven't sent any ETH", async () => {
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                await network.provider.request({ method: "evm_mine", params: [] })
                const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x") // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
                assert(!upkeepNeeded)
            })
            it("returns false if raffle isn't open", async () => {
                await raffle.enterRaffle({ value: raffleEntranceFee })
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                await network.provider.request({ method: "evm_mine", params: [] })
                await raffle.performUpkeep([]) // changes the state to calculating
                const raffleState = await raffle.getRaffleState() // stores the new state
                const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x") // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
                assert.equal(raffleState.toString() == "1", upkeepNeeded == false)
            })
            it("returns false if enough time hasn't passed", async () => {
                await raffle.enterRaffle({ value: raffleEntranceFee })
                await network.provider.send("evm_increaseTime", [interval.toNumber() - 5]) // use a higher number here if this test fails
                await network.provider.request({ method: "evm_mine", params: [] })
                const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x") // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
                assert(!upkeepNeeded)
            })
            it("returns true if enough time has passed, has players, eth, and is open", async () => {
                await raffle.enterRaffle({ value: raffleEntranceFee })
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                await network.provider.request({ method: "evm_mine", params: [] })
                const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x") // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
                assert(upkeepNeeded)
            })
          })

          describe("performUpkeep", function () {
            it("can only run if checkupkeep is true", async () => {
                await raffle.enterRaffle({ value: raffleEntranceFee })
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                await network.provider.request({ method: "evm_mine", params: [] })
                const tx = await raffle.performUpkeep("0x") 
                assert(tx)
            })
            it("reverts if checkup is false", async () => {
                await expect(raffle.performUpkeep("0x")).to.be.revertedWith( 
                    "Raffle__UpkeepNotNeeded"
                )
            })
        })
      })