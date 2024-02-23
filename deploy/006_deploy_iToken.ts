import {HardhatRuntimeEnvironment} from "hardhat/types";
import {DeployFunction} from "hardhat-deploy/types";
import {deploy} from "../utils/deployContracts";
import {loadConfig} from "../configs/loader";
import {getNetworkName} from "hardhat-deploy/dist/src/utils";
import {deployiToken} from "../utils/operations";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts, ethers} = hre;
  const {deployer} = await getNamedAccounts();

  const controller = await deployments.get("controller");
  const msdController = await deployments.get("msdController");
  const {iTokenConfigs} = await loadConfig(getNetworkName(hre.network));

  // Deploy underlying when use local environment
  if (!hre.network.live) {
    for (let iToken in iTokenConfigs) {
      const iTokenConfig = iTokenConfigs[iToken];
      if (
        !iTokenConfig.iTokenUnderlyingAddress &&
        iTokenConfig.iTokenUnderlyingAddress != ethers.ZeroAddress
      ) {
        const token = iToken.split("i")[1];
        const underlying = await deploy(hre, token, "Token", [
          iTokenConfig.iTokenName.split("dForce ")[1],
          iTokenConfig.iTokenSymbol.split("i")[1],
          iTokenConfig.iTokenDecimals,
        ]);
        iTokenConfig.iTokenUnderlyingAddress = underlying.address;
      }
    }
  }

  for (let iToken in iTokenConfigs) {
    await deployiToken(
      hre,
      deployer,
      iToken,
      controller,
      msdController,
      iTokenConfigs[iToken]
    );
  }
};
export default func;
func.tags = ["iToken"];
func.dependencies = ["LendingController", "InterestRateModel", "MSD"];
