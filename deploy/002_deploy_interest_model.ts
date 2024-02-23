import {HardhatRuntimeEnvironment} from "hardhat/types";
import {DeployFunction} from "hardhat-deploy/types";
import {deploy} from "../utils/deployContracts";
import {loadConfig} from "../configs/loader";
import {getNetworkName} from "hardhat-deploy/dist/src/utils";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {iTokenConfigs} = await loadConfig(getNetworkName(hre.network));
  // Read the interest rate model from iToken configs and deploy those
  const interestRateModelSet = new Set<string>(
    Object.entries(iTokenConfigs).map(([key, value]) => value.interestModel)
  );

  for (const interestModel of interestRateModelSet) {
    await deploy(hre, interestModel);
  }
};

export default func;
func.tags = ["InterestRateModel"];
