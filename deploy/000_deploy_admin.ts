import {HardhatRuntimeEnvironment} from "hardhat/types";
import {DeployFunction} from "hardhat-deploy/types";
import {deploy} from "../utils/deployContracts";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  await deploy(hre, "proxyAdmin", "ProxyAdmin");
  await deploy(hre, "timelock", "Timelock");
};

export default func;
func.tags = ["Admin"];
