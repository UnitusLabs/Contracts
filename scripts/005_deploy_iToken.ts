import * as hre from "hardhat";
import {deployiToken} from "../utils/operations";
import {loadConfig} from "../configs/loader";
import {getNetworkName} from "hardhat-deploy/dist/src/utils";

async function main() {
  const {deployments, getNamedAccounts} = hre;
  const {deployer} = await getNamedAccounts();

  const controller = await deployments.get("controller");
  const msdController = await deployments.get("msdController");
  const {iTokenConfigs} = await loadConfig(getNetworkName(hre.network));

  for (let iToken in iTokenConfigs) {
    await deployiToken(
      hre,
      deployer,
      iToken,
      controller,
      msdController,
      iTokenConfigs[iToken]
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
