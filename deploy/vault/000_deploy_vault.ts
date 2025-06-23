import {HardhatRuntimeEnvironment} from "hardhat/types";
import {DeployFunction} from "hardhat-deploy/types";
import {deploy, updateValue, execute} from "../../utils/deployContracts";
import {deployiToken, addMarkets} from "../../utils/operations";
import {loadConfig} from "../../configs/loader";
import {getNetworkName} from "hardhat-deploy/dist/src/utils";

async function deployInterestRateModel(hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts, ethers} = hre;
  const {read, log} = deployments;
  const {owner, deployer} = await getNamedAccounts();

  await deploy(hre, "FixedInterestRateSecondModelV2");
}

async function deployController(hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts, ethers} = hre;
  const {read, log} = deployments;
  const {owner, deployer} = await getNamedAccounts();

  const implicit = await deployments.get("controllerV2ExtraImplicit");
  const explicit = await deployments.get("controllerV2ExtraExplicit");

  await deploy(
    hre,
    "vaultController", // instance name
    "ControllerV2BLP", // contractName
    [implicit.address, explicit.address], // constructorArgs
    true, // proxy
    "initializeV2", // initFunctionName
    [implicit.address, explicit.address], // initArgs
    false //initImplementation:
  );
}

async function deployRewardDistributor(hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts, ethers} = hre;
  const {read, log} = deployments;
  const {owner, deployer} = await getNamedAccounts();

  const controller = await deployments.get("vaultController");

  await deploy(
    hre,
    "vaultRewardDistributor", // fileName
    "RewardDistributorSecondV3", // contractName
    [], // constructorArgs
    true, // proxy
    "initialize", // initFunctionName
    [controller.address] // initArgs
  );
}

async function configController(hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts, ethers} = hre;
  const {read, log} = deployments;
  const {owner, deployer} = await getNamedAccounts();

  const {controllerConfigs} = await loadConfig(getNetworkName(hre.network));

  const oracle = await deployments.get("oracle");
  // const rewardDistributor = await deployments.get("vaultRewardDistributor");

  // await updateValue(
  //   hre,
  //   "vaultController",
  //   deployer,
  //   "rewardDistributor",
  //   [],
  //   rewardDistributor.address,
  //   "_setRewardDistributor",
  //   []
  // );

  await updateValue(
    hre,
    "vaultController",
    deployer,
    "priceOracle",
    [],
    oracle.address,
    "_setPriceOracle",
    []
  );

  await updateValue(
    hre,
    "vaultController",
    deployer,
    "closeFactorMantissa",
    [],
    ethers.parseEther(controllerConfigs.closeFactor),
    "_setCloseFactor",
    []
  );

  await updateValue(
    hre,
    "vaultController",
    deployer,
    "liquidationIncentiveMantissa",
    [],
    ethers.parseEther(controllerConfigs.liquidationIncentive),
    "_setLiquidationIncentive",
    []
  );

  await updateValue(
    hre,
    "vaultController",
    deployer,
    "pauseGuardian",
    [],
    controllerConfigs.pauseGuardian,
    "_setPauseGuardian",
    []
  );
}

async function deployVaultiTokens(hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts, ethers} = hre;
  const {read, log} = deployments;
  const {owner, deployer} = await getNamedAccounts();

  const controller = await deployments.get("vaultController");
  const msdController = await deployments.get("msdController");

  const {vaultTokenConfigs} = await loadConfig(getNetworkName(hre.network));

  for (const [token, tokenConfig] of Object.entries(vaultTokenConfigs)) {
    await deployiToken(
      hre,
      deployer,
      token,
      controller,
      msdController,
      tokenConfig
    );
  }
}

async function setVTokenPrices(hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts, ethers} = hre;
  const {read, log} = deployments;
  const {owner, deployer} = await getNamedAccounts();

  const vRWA = await deployments.get("vRWA");
  const vUSDT0 = await deployments.get("vUSDT0");

  const assets = [vRWA.address, vUSDT0.address];
  const readerPosterModel = "0xCE1A42eC7d25ceF9468d8A7D00B9C532a4aEB918";
  const signatures = [
    "_setPrice(address,uint256)",
    "_setPrice(address,uint256)",
  ];

  const calldata = [
    ethers.AbiCoder.defaultAbiCoder().encode(
      ["address", "uint256"],
      [vRWA.address, ethers.parseEther("0.45")]
    ),
    ethers.AbiCoder.defaultAbiCoder().encode(
      ["address", "uint256"],
      [vUSDT0.address, ethers.parseUnits("0.998", 30)]
    ),
  ];

  await execute(hre, "oracle", deployer, "_setAssetPriceModelBatch", assets, [
    readerPosterModel,
    readerPosterModel,
  ]);

  await execute(
    hre,
    "oracle",
    deployer,
    "_setAssets",
    assets,
    signatures,
    calldata
  );
}

async function setInterestRate(hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts, ethers} = hre;
  const {read, log} = deployments;
  const {owner, deployer} = await getNamedAccounts();

  const iUSDTs1 = await deployments.get("iUSDTs1");

  // 8%
  const borrowRatePerSecond = BigInt("2440675908");

  await updateValue(
    hre,
    "FixedInterestRateSecondModelV2",
    deployer,
    "borrowRatesPerSecond",
    [iUSDTs1.address],
    borrowRatePerSecond,
    "_setBorrowRate",
    [iUSDTs1.address]
  );
}

async function addVaultMarkets(hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts, ethers} = hre;
  const {read, log} = deployments;
  const {owner, deployer} = await getNamedAccounts();

  await addMarkets(hre, "vault");
}

async function deployRWAToken(hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts, ethers} = hre;
  const {read, log} = deployments;
  const {owner, deployer} = await getNamedAccounts();

  await deploy(hre, "RWA", "Token", ["RWA Test", "RWA", 18]);
}

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts, ethers} = hre;
  const {read, log} = deployments;
  const {owner, deployer} = await getNamedAccounts();

  // await deployRWAToken(hre);

  await deployInterestRateModel(hre);
  await deployController(hre);
  await deployVaultiTokens(hre);

  // set vToken prices for testing
  // await setVTokenPrices(hre);

  await configController(hre);
  await setInterestRate(hre);

  // the final step, should be executed after BLPLockup is done
  // await addVaultMarkets(hre);
};

export default func;
func.tags = ["Vault"];
