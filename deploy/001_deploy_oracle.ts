import {HardhatRuntimeEnvironment} from "hardhat/types";
import {DeployFunction} from "hardhat-deploy/types";
import {deploy} from "../utils/deployContracts";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {getNamedAccounts, ethers} = hre;
  const {deployer} = await getNamedAccounts();

  if (!hre.network.live) {
    await deploy(hre, "oracle", "PriceOracleV2", [
      deployer,
      ethers.parseEther("0.1"), // maxSwing
    ]);
  }
};
export default func;
func.tags = ["Oracle"];
