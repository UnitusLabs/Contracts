import {HardhatRuntimeEnvironment} from "hardhat/types";
import {DeployFunction} from "hardhat-deploy/types";
import {deploy, updateValue, execute} from "../utils/deployContracts";
import {mergeABIs} from "hardhat-deploy/dist/src/utils";
import {getNetworkName} from "hardhat-deploy/dist/src/utils";
import {loadConfig} from "../configs/loader";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts, ethers} = hre;
  const {get, read, log, getArtifact, save} = deployments;
  const {deployer, owner} = await getNamedAccounts();

  const oracle = await deployments.get("oracle");

  const {controllerConfigs, sModeConfigs} = await loadConfig(
    getNetworkName(hre.network)
  );

  const implicit = await deploy(
    hre,
    "controllerV2ExtraImplicit",
    "ControllerV2ExtraImplicit"
  );

  const explicit = await deploy(
    hre,
    "controllerV2ExtraExplicit",
    "ControllerV2ExtraExplicit"
  );

  const controller = await deploy(
    hre,
    "controller", // instance name
    "ControllerV2", // contractName
    // "ControllerV2BLP", // contractName
    [implicit.address, explicit.address], // constructorArgs
    true, // proxy
    "initializeV2", // initFunctionName
    [implicit.address, explicit.address], // initArgs
    false //initImplementation:
  );

  const rewardDistributor = await deploy(
    hre,
    "rewardDistributor", // fileName
    "RewardDistributorSecondV3", // contractName
    [], // constructorArgs
    true, // proxy
    "initialize", // initFunctionName
    [controller.address] // initArgs
  );

  await updateValue(
    hre,
    "controller",
    deployer,
    "rewardDistributor",
    [],
    rewardDistributor.address,
    "_setRewardDistributor",
    []
  );

  await updateValue(
    hre,
    "controller",
    deployer,
    "priceOracle",
    [],
    oracle.address,
    "_setPriceOracle",
    []
  );

  await updateValue(
    hre,
    "controller",
    deployer,
    "closeFactorMantissa",
    [],
    ethers.parseEther(controllerConfigs.closeFactor),
    "_setCloseFactor",
    []
  );

  await updateValue(
    hre,
    "controller",
    deployer,
    "liquidationIncentiveMantissa",
    [],
    ethers.parseEther(controllerConfigs.liquidationIncentive),
    "_setLiquidationIncentive",
    []
  );

  await updateValue(
    hre,
    "controller",
    deployer,
    "pauseGuardian",
    [],
    controllerConfigs.pauseGuardian,
    "_setPauseGuardian",
    []
  );

  const implictDeployment = await get("controllerV2ExtraImplicit");
  const controllerDeployment = await get("controller");
  const controllerMergedABI = mergeABIs(
    [implictDeployment.abi, controllerDeployment.abi],
    {
      check: false,
      skipSupportsInterface: true,
    }
  );

  await save("controller", {...controllerDeployment, abi: controllerMergedABI});

  let allSModeLength = Number(await read("controller", "getSModeLength"));
  log("Current sMode length : ", allSModeLength);
  for (let sModeIndex in sModeConfigs) {
    const sModeConfig = sModeConfigs[sModeIndex];
    let hasSMode = false;
    for (let i = 0; i < allSModeLength; i++) {
      const sModeDetails = await read("controller", "sModes", i);
      if (sModeConfig.label == sModeDetails.label) {
        hasSMode = true;
        break;
      }
    }

    if (!hasSMode) {
      console.log("Going to add sMode ", sModeConfig.label);
      await execute(
        hre,
        "controller",
        owner,
        "_addSMode",
        ethers.parseEther(sModeConfig.liquidationIncentive),
        ethers.parseEther(sModeConfig.closeFactor),
        sModeConfig.label
      );
    }
  }
  allSModeLength = Number(await read("controller", "getSModeLength"));
  log("After contract sMode length is: ", allSModeLength, "\n");
};

export default func;
func.tags = ["LendingController"];
func.dependencies = ["Admin", "Oracle"];
