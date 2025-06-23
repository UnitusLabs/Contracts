import * as hre from "hardhat";
import {getNetworkName} from "hardhat-deploy/dist/src/utils";
import {deploy} from "../utils/deployContracts";
import {loadConfig} from "../configs/loader";
import {timelockExectuteTransactions} from "../utils/operations";

export async function upgradeBLP() {
  const {deployments, getNamedAccounts, ethers} = hre;
  const {read, log} = deployments;
  const {owner} = await getNamedAccounts();

  const controllerV2ExtraImplicit = await deployments.get(
    "controllerV2ExtraImplicit"
  );
  const controllerV2ExtraExplicit = await deployments.get(
    "controllerV2ExtraExplicit"
  );

  const ControllerV2BLP_Impl = await deploy(
    hre,
    "ControllerV2BLP_Impl",
    "ControllerV2BLP",
    [controllerV2ExtraImplicit.address, controllerV2ExtraExplicit.address]
  );
  await deploy(hre, "iTokenV2BLP_Impl", "iTokenV2BLP");
  await deploy(hre, "iETHV2BLP_Impl", "iETHV2BLP");
  await deploy(hre, "iMSDV2BLP_Impl", "iMSDV2BLP");

  const {iTokenConfigs} = await loadConfig(getNetworkName(hre.network));

  const proxyAdmin = (await hre.deployments.get("proxyAdmin")).address;
  const controller = (await hre.deployments.get("controller")).address;
  const rewardDistributorManager = (
    await hre.deployments.get("rewardDistributorManager")
  ).address;

  let txs = [];

  for (const iToken in iTokenConfigs) {
    const iTokenConfig = iTokenConfigs[iToken];
    const iTokenAddr = (await hre.deployments.get(iToken)).address;
    const newImpl = (
      await hre.deployments.get(iTokenConfig.contractName + "_Impl")
    ).address;

    txs.push({
      target: proxyAdmin,
      value: 0,
      signature: "upgrade(address,address)",
      args: [iTokenAddr, newImpl],
    });
  }

  txs.push({
    target: proxyAdmin,
    value: 0,
    signature: "upgrade(address,address)",
    args: [controller, ControllerV2BLP_Impl.address],
  });

  txs.push({
    target: controller,
    value: 0,
    signature: "_setRewardDistributor(address)",
    args: [rewardDistributorManager],
  });

  await timelockExectuteTransactions(hre, owner, txs);
}

async function main() {
  await upgradeBLP();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
