import {HardhatRuntimeEnvironment} from "hardhat/types";
import {DeployFunction} from "hardhat-deploy/types";
import {addMarkets} from "../utils/operations";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  await addMarkets(hre);
};

export default func;
func.tags = ["AddMarket"];
func.dependencies = ["LendingController"];
