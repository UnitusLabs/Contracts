import {HardhatRuntimeEnvironment} from "hardhat/types";
import {DeployFunction} from "hardhat-deploy/types";
import {deploy, execute} from "../utils/deployContracts";
import {getNetworkName} from "hardhat-deploy/dist/src/utils";
import {loadConfig} from "../configs/loader";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre;
  const {read, log} = deployments;
  const {deployer, owner} = await getNamedAccounts();

  const msdController = await deployments.get("msdController");
  const {msdTokenConfigs} = await loadConfig(getNetworkName(hre.network));

  for (let msd in msdTokenConfigs) {
    const assetConfig = msdTokenConfigs[msd];
    const initArgs: any[] = [
      assetConfig.name,
      assetConfig.symbol,
      assetConfig.decimals,
    ];

    await deploy(
      hre,
      msd,
      "MSD",
      [], // constructorArgs,
      true, // proxy
      "initialize", // initFunction
      initArgs // initArgs
    );

    let msdCurrentMinters = await read(msd, "getMinters");
    if (!msdCurrentMinters.includes(msdController.address)) {
      await execute(hre, msd, owner, "_addMinter", msdController.address);
    }
  }
};

export default func;
func.tags = ["MSD"];
func.dependencies = ["MSDController"];
