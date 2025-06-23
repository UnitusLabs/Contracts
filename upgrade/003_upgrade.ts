import {HardhatRuntimeEnvironment} from "hardhat/types";
import {DeployFunction} from "hardhat-deploy/types";
import {execute, getOwner} from "../utils/deployContracts";
import {transferOwnershipToTimelock} from "../utils/operations";
import {loadConfig} from "../configs/loader";
import {getNetworkName} from "hardhat-deploy/dist/src/utils";

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

  // // Don't transfer ownership for timelock itself, oracle etc.
  // await transferOwnershipToTimelock(hre, deployer, owner, [
  //   "USX",
  //   "msdController",
  //   "proxyAdmin",
  //   "timelock",
  //   "oracle",
  //   "upgradeHelper",
  //   "controllerV2ExtraImplicit",
  //   "controllerV2ExtraExplicit",
  // ]);

  // accept the upgradeHelper ownership
  await execute(hre, "upgradeHelper", owner, "_acceptOwner");

  // Set the new interest rate model
  const {iTokenConfigs} = await loadConfig(getNetworkName(hre.network));

  let iTokens: string[] = [];
  let interestRateModels: string[] = [];
  for (let iToken in iTokenConfigs) {
    let iTokenConfig = iTokenConfigs[iToken];

    const interestModel = await deployments.get(iTokenConfig.interestModel);
    const iTokenDeployment = await deployments.get(iToken);

    log(iToken);
    // log(interestModel.address);
    // log(iTokenDeployment.address);

    iTokens.push(iTokenDeployment.address);
    interestRateModels.push(interestModel.address);
  }

  await execute(
    hre,
    "upgradeHelper",
    "owner",
    "_setInterestRateModelsOf",
    iTokens,
    interestRateModels
  );

  // transfer the timelock ownership
  await execute(
    hre,
    "timelock",
    "owner",
    "_setPendingOwner",
    upgradeHelper.address
  );

  // Accept the timelock ownership
  await execute(
    hre,
    "upgradeHelper",
    "owner",
    "acceptOwnershipOf",
    timelock.address
  );

  // Upgrade
  await execute(hre, "upgradeHelper", "owner", "upgrade");

  // Transfer the timelock ownership back
  await execute(
    hre,
    "upgradeHelper",
    "owner",
    "transferOwnershipOf",
    timelock.address,
    owner
  );

  // Owner accept the timelock ownership
  await execute(hre, "timelock", owner, "_acceptOwner");
};

export default func;
func.tags = ["Upgrade"];
func.dependencies = ["UpgradeHelper"];
