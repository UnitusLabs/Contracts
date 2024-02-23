import {HardhatRuntimeEnvironment} from "hardhat/types";
import {DeployFunction} from "hardhat-deploy/types";
import {deploy} from "../utils/deployContracts";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  await deploy(
    hre,
    "msdController", // contract instance name
    "MSDControllerV2", // contractName
    [], // constructorArgs
    true, // proxy
    "initialize", // initFunctionName
    [] // initArgs
  );
};

export default func;
func.tags = ["MSDController"];
func.dependencies = ["Admin"];
