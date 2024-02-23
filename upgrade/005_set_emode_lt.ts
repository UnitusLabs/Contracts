import {HardhatRuntimeEnvironment} from "hardhat/types";
import {DeployFunction} from "hardhat-deploy/types";
import {getNetworkName} from "hardhat-deploy/dist/src/utils";
import {loadConfig} from "../configs/loader";
import {setupEModes, setiTokenEMode} from "../utils/operations";
import {updateValue} from "../utils/deployContracts";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers} = hre;

  const {iTokenConfigs, eModeConfigs} = await loadConfig(
    getNetworkName(hre.network)
  );

  // Setup Emodes
  await setupEModes(hre, "owner", eModeConfigs);

  // Add iTokens to eModes
  for (let iToken in iTokenConfigs) {
    const iTokenConfig = iTokenConfigs[iToken];
    const iTokenDeployment = await deployments.get(iToken);

    deployments.log(iToken);

    await setiTokenEMode(hre, "owner", iTokenDeployment.address, iTokenConfig);

    await updateValue(
      hre,
      "controller",
      "owner",
      "getLiquidationThreshold",
      [iTokenDeployment.address],
      ethers.parseEther(iTokenConfig.liquidationThreshold),
      "_setLiquidationThreshold",
      [iTokenDeployment.address]
    );
  }
};

export default func;
func.tags = ["EModes"];
// func.dependencies = ["Admin", "Oracle", "Upgrade"];
