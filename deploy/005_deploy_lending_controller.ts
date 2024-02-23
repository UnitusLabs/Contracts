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

  const {controllerConfigs, eModeConfigs} = await loadConfig(
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

  let allEModeLength = Number(await read("controller", "getEModeLength"));
  log("Current eMode length : ", allEModeLength);
  for (let eModeIndex in eModeConfigs) {
    const eModeConfig = eModeConfigs[eModeIndex];
    let hasEMode = false;
    for (let i = 0; i < allEModeLength; i++) {
      const eModeDetails = await read("controller", "eModes", i);
      if (eModeConfig.label == eModeDetails.label) {
        hasEMode = true;
        break;
      }
    }

    if (!hasEMode) {
      console.log("Going to add eMode ", eModeConfig.label);
      await execute(
        hre,
        "controller",
        owner,
        "_addEMode",
        ethers.parseEther(eModeConfig.liquidationIncentive),
        ethers.parseEther(eModeConfig.closeFactor),
        eModeConfig.label
      );
    }
  }
  allEModeLength = Number(await read("controller", "getEModeLength"));
  log("After contract eMode length is: ", allEModeLength, "\n");
};

export default func;
func.tags = ["LendingController"];
func.dependencies = ["Admin", "Oracle"];
