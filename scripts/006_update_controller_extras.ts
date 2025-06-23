import * as hre from "hardhat";
import {deploy, execute} from "../utils/deployContracts";

export async function upgradeControllerExtras() {
  const {deployments, getNamedAccounts, ethers} = hre;
  const {read, log} = deployments;
  const {owner} = await getNamedAccounts();

  const controllerExtraImplicit = await deploy(
    hre,
    "controllerV2ExtraImplicit",
    "ControllerV2ExtraImplicit"
  );
  const controllerExtraExplicit = await deploy(
    hre,
    "controllerV2ExtraExplicit",
    "ControllerV2ExtraExplicit"
  );

  // await execute(
  //   hre,
  //   "controller",
  //   "owner",
  //   "_setExtraExplicit",
  //   controllerExtraExplicit.address
  // );

  await execute(
    hre,
    "controller",
    "owner",
    "_setExtraImplicit",
    controllerExtraImplicit.address
  );
}

async function main() {
  await upgradeControllerExtras();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
