import {HardhatRuntimeEnvironment} from "hardhat/types";
import {DeployFunction} from "hardhat-deploy/types";
import {deploy, updateValue} from "../utils/deployContracts";
import {setTimeLockStrategyData} from "../utils/operations";
import {loadConfig} from "../configs/loader";
import {getNetworkName} from "hardhat-deploy/dist/src/utils";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts, ethers} = hre;
  const {read, log} = deployments;
  const {owner} = await getNamedAccounts();

  const controller = await deployments.get("controller");

  const {timeLockStrategyConfigs} = await loadConfig(
    getNetworkName(hre.network)
  );

  // Deploy time lock strategy contract
  let constructorArgs = [
    controller.address,
    timeLockStrategyConfigs.minSingleWaitSeconds,
    timeLockStrategyConfigs.midSingleWaitSeconds,
    timeLockStrategyConfigs.maxSingleWaitSeconds,
    timeLockStrategyConfigs.minDailyWaitSeconds,
    timeLockStrategyConfigs.midDailyWaitSeconds,
    timeLockStrategyConfigs.maxDailyWaitSeconds,
  ];

  const timeLockStrategy = await deploy(
    hre,
    "timeLockStrategy",
    "TimeLockStrategy",
    constructorArgs,
    true,
    "initialize",
    constructorArgs,
    false // timeLockStrategy initializes on contructor
  );

  await setTimeLockStrategyData(hre);

  // Deploy time lock contract:
  const initArgs = [controller.address];
  const timeLock = await deploy(
    hre,
    "defaultTimeLock",
    "DefaultTimeLock",
    initArgs,
    true,
    "initialize",
    initArgs,
    false // DefaultTimeLock initializes on contructor
  );

  await updateValue(
    hre,
    "controller",
    "owner",
    "timeLock",
    [],
    timeLock.address,
    "_setTimeLock",
    []
  );

  await updateValue(
    hre,
    "controller",
    "owner",
    "timeLockStrategy",
    [],
    timeLockStrategy.address,
    "_setTimeLockStrategy",
    []
  );
};

export default func;
func.tags = ["TimeLock"];
func.dependencies = ["LendingController"];
