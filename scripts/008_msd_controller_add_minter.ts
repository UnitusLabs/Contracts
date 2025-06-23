import * as hre from "hardhat";
import {deployiToken} from "../utils/operations";
import {loadConfig} from "../configs/loader";
import {getNetworkName} from "hardhat-deploy/dist/src/utils";
import {execute} from "../utils/deployContracts";

async function main() {
  const {deployments} = hre;

  const USX = await deployments.get("USX");
  const minter = "0xD07f4Fe56Fc7628Ca130B813c46Ee7a61019Fd0F";
  const cap = hre.ethers.parseUnits("1000000", 18);

  await execute(
    hre,
    "msdController",
    "owner",
    "_addMSD",
    USX.address,
    [minter],
    [cap]
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
