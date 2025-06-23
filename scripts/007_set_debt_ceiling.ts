import * as hre from "hardhat";
import {deployiToken} from "../utils/operations";
import {loadConfig} from "../configs/loader";
import {getNetworkName} from "hardhat-deploy/dist/src/utils";
import {execute} from "../utils/deployContracts";

async function main() {
  const {deployments, getNamedAccounts} = hre;

  const iARB = await deployments.get("iARB");
  await execute(
    hre,
    "controller",
    "owner",
    "_setDebtCeiling",
    iARB.address,
    hre.ethers.parseUnits("50000", 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
