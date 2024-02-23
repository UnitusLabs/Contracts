import {HardhatRuntimeEnvironment} from "hardhat/types";
import {DeployFunction} from "hardhat-deploy/types";
import {deploy} from "../utils/deployContracts";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments} = hre;
  const controller = await deployments.get("controller");
  const iUSX = await deployments.get("iUSX");

  await deploy(
    hre,
    "lendingDataV2", // fileName
    "LendingDataV2", // contractName
    [controller.address, iUSX.address], // constructorArgs
    true, // proxy
    "initialize", // initFunctionName
    [controller.address, iUSX.address], // initArgs
    false //initImplementation
  );
};
export default func;
func.tags = ["LendingData"];
func.dependencies = ["LendingController"];
