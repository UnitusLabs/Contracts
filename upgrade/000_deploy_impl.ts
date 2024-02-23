import {HardhatRuntimeEnvironment} from "hardhat/types";
import {DeployFunction} from "hardhat-deploy/types";
import {deploy} from "../utils/deployContracts";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const controllerV2ExtraImplicit = await deploy(
    hre,
    "controllerV2ExtraImplicit",
    "ControllerV2ExtraImplicit"
  );
  const controllerV2ExtraExplicit = await deploy(
    hre,
    "controllerV2ExtraExplicit",
    "ControllerV2ExtraExplicit"
  );
  await deploy(hre, "ControllerV2_Impl", "ControllerV2", [
    controllerV2ExtraImplicit.address,
    controllerV2ExtraExplicit.address,
  ]);

  await deploy(
    hre,
    "RewardDistributorSecondV3_Impl",
    "RewardDistributorSecondV3"
  );

  await deploy(hre, "iTokenV2_Impl", "iTokenV2");
  await deploy(hre, "iETHV2_Impl", "iETHV2");
  await deploy(hre, "iMSDV2_Impl", "iMSDV2");
};

export default func;
func.tags = ["Implementations"];
