import {HardhatRuntimeEnvironment} from "hardhat/types";
import {DeployFunction} from "hardhat-deploy/types";
import {getNetworkName} from "hardhat-deploy/dist/src/utils";
import {deploy} from "../utils/deployContracts";
import {loadConfig} from "../configs/loader";
import {timelockExectuteTransactions} from "../utils/operations";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
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
  const iTokenV2BLP_Impl = await deploy(hre, "iTokenV2BLP_Impl", "iTokenV2BLP");
  const iETHV2BLP_Impl = await deploy(hre, "iETHV2BLP_Impl", "iETHV2BLP");
  const iMSDV2BLP_Impl = await deploy(hre, "iMSDV2BLP_Impl", "iMSDV2BLP");

  const controller = (await hre.deployments.get("controller")).address;
  const proxyAdmin = (await hre.deployments.get("proxyAdmin")).address;
  const timelock = (await hre.deployments.get("timelock")).address;

  let txs: any[] = [];
  const currentImpl = await read(
    "proxyAdmin",
    "getProxyImplementation",
    controller
  );
  if (ControllerV2BLP_Impl.address != currentImpl) {
    txs.push({
      target: proxyAdmin,
      value: 0,
      signature: "upgrade(address,address)",
      args: [controller, ControllerV2BLP_Impl.address],
    });
    console.log(`\ncontroller upgrade impl:`);
    console.log(`ControllerV2BLP_Impl: ${ControllerV2BLP_Impl.address}\n`);
  }

  const assets = await read("controller", "getAlliTokens");
  for (let index = 0; index < assets.length; index++) {
    const asset = assets[index];
    const Asset = await ethers.getContractAtWithSignerAddress(
      "iTokenV2BLP",
      asset,
      timelock
    );

    const isiToken = await Asset.isiToken();
    const underlying = await Asset.underlying();
    let implName = isiToken
      ? underlying == ethers.ZeroAddress
        ? "iETHV2BLP_Impl"
        : "iTokenV2BLP_Impl"
      : "iMSDV2BLP_Impl";

    const impl = eval(implName).address;
    const currentImpl = await read(
      "proxyAdmin",
      "getProxyImplementation",
      asset
    );
    if (impl != currentImpl) {
      txs.push({
        target: proxyAdmin,
        value: 0,
        signature: "upgrade(address,address)",
        args: [asset, impl],
      });
      const symbol = await Asset.symbol();
      console.log(`${symbol} upgrade impl:`);
      console.log(`${implName}: ${impl}\n`);
    }
  }

  await timelockExectuteTransactions(hre, owner, txs);
};

export default func;
func.tags = ["UpgradeBLP"];
