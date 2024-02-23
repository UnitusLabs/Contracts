import {HardhatRuntimeEnvironment} from "hardhat/types";
import {DeployFunction} from "hardhat-deploy/types";
import {deploy, execute} from "../utils/deployContracts";
import {loadConfig} from "../configs/loader";
import {getNetworkName} from "hardhat-deploy/dist/src/utils";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts, ethers} = hre;
  const {read, log, rawTx} = deployments;
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

  // Set the new interest rate model
  const {iTokenConfigs} = await loadConfig(getNetworkName(hre.network));

  let iTokens: string[] = [];
  let interestRateModels: string[] = [];
  for (let iToken in iTokenConfigs) {
    let iTokenConfig = iTokenConfigs[iToken];

    const interestModel = await deployments.get(iTokenConfig.interestModel);
    const iTokenDeployment = await deployments.get(iToken);

    log(iToken);
    // log(interestModel.address);
    // log(iTokenDeployment.address);

    iTokens.push(iTokenDeployment.address);
    interestRateModels.push(interestModel.address);
  }

  await execute(
    hre,
    "upgradeHelper",
    deployer,
    "_setInterestRateModelsOf",
    iTokens,
    interestRateModels
  );
};

export default func;
func.tags = ["UpgradeHelper"];
func.dependencies = ["Implementations", "InterestRateModel"];
