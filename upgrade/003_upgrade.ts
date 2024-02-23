import {HardhatRuntimeEnvironment} from "hardhat/types";
import {DeployFunction} from "hardhat-deploy/types";
import {execute} from "../utils/deployContracts";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts, ethers} = hre;
  const {read, log, rawTx} = deployments;
  const {deployer, owner} = await getNamedAccounts();

  const timelock = await deployments.get("timelock");
  const upgradeHelper = await deployments.get("upgradeHelper");

  // transfer some gas to owner multisig
  if (hre.network.name === "hardhat") {
    await rawTx({
      from: deployer,
      to: owner,
      log: true,
      value: ethers.parseEther("1"),
    });
  }

  // transfer the timelock ownership
  await execute(
    hre,
    "timelock",
    owner,
    "_setPendingOwner",
    upgradeHelper.address
  );

  // Accept the timelock ownership
  await execute(
    hre,
    "upgradeHelper",
    deployer,
    "acceptOwnershipOf",
    timelock.address
  );

  // Upgrade
  await execute(hre, "upgradeHelper", deployer, "upgrade");

  // Transfer the timelock ownership back
  await execute(
    hre,
    "upgradeHelper",
    deployer,
    "transferOwnershipOf",
    timelock.address,
    owner
  );

  // Owner accept the timelock ownership
  await execute(hre, "timelock", owner, "_acceptOwner");
};

export default func;
func.tags = ["Upgrade"];
// func.dependencies = ["UpgradeHelper"];
