import * as hre from "hardhat";
import {upgrade} from "../utils/deployContracts";

export async function upgradeController() {
  const {deployments, getNamedAccounts, ethers} = hre;
  const {read, log} = deployments;
  const {owner} = await getNamedAccounts();

  const controllerExtraImplicit = await deployments.get(
    "controllerV2ExtraImplicit"
  );
  const controllerExtraExplicit = await deployments.get(
    "controllerV2ExtraExplicit"
  );

  await upgrade(hre, "controller", "ControllerV2", "ControllerV2_Impl_new", [
    controllerExtraImplicit.address,
    controllerExtraExplicit.address,
  ]);
}

async function main() {
  await upgradeController();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
