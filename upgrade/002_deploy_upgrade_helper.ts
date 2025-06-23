import {HardhatRuntimeEnvironment} from "hardhat/types";
import {DeployFunction} from "hardhat-deploy/types";
import {deploy, execute} from "../utils/deployContracts";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts, ethers} = hre;
  const {deployer, owner} = await getNamedAccounts();

  const proxyAdmin = await deployments.get("proxyAdmin");
  const timelock = await deployments.get("timelock");

  const controller = await deployments.get("controller");
  const rewardDistributor = await deployments.get("rewardDistributor");

  const controllerImpl = await deployments.get("ControllerV2_Impl");
  const controllerExtraImplicit = await deployments.get(
    "controllerV2ExtraImplicit"
  );
  const controllerExtraExplicit = await deployments.get(
    "controllerV2ExtraExplicit"
  );
  const rewardDistributorImpl = await deployments.get(
    "RewardDistributorSecondV3_Impl"
  );

  const iTokenV2_Impl = await deployments.get("iTokenV2_Impl");
  const iETHV2_Impl = await deployments.get("iETHV2_Impl");
  const iMSDV2_Impl = await deployments.get("iMSDV2_Impl");

  // Deploy the UpgradeHelper
  const upgradeHelper = await deploy(hre, "upgradeHelper", "UpgradeHelper", [
    proxyAdmin.address,
    timelock.address,
    controller.address,
    rewardDistributor.address,
    controllerImpl.address,
    controllerExtraImplicit.address,
    controllerExtraExplicit.address,
    rewardDistributorImpl.address,
    iTokenV2_Impl.address,
    iETHV2_Impl.address,
    iMSDV2_Impl.address,
  ]);

  // Transfer upgradeHelper's ownership to multisig owner
  await execute(hre, "upgradeHelper", deployer, "_setPendingOwner", owner);
};

export default func;
func.tags = ["UpgradeHelper"];
func.dependencies = ["Implementations", "InterestRateModel"];
