import {HardhatRuntimeEnvironment} from "hardhat/types";
import {DeployFunction} from "hardhat-deploy/types";
import {getNetworkName} from "hardhat-deploy/dist/src/utils";
import {loadConfig} from "../configs/loader";
import {setupSModes, updateiTokenConfig} from "../utils/operations";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers, getNamedAccounts} = hre;
  const {read, log, rawTx} = deployments;
  const {deployer, owner} = await getNamedAccounts();

  // transfer some gas to owner multisig
  if (hre.network.name === "hardhat") {
    await rawTx({
      from: deployer,
      to: owner,
      log: true,
      value: ethers.parseEther("1"),
    });
  }

  const {iTokenConfigs, sModeConfigs} = await loadConfig(
    getNetworkName(hre.network)
  );

  // Setup SModes
  await setupSModes(hre, "owner", sModeConfigs);

  for (let iToken in iTokenConfigs) {
    const iTokenConfig = iTokenConfigs[iToken];
    const iTokenDeployment = await deployments.get(iToken);

    deployments.log(iToken);

    await updateiTokenConfig(
      hre,
      "owner",
      iTokenDeployment.address,
      iTokenConfig
    );
  }
};

export default func;
func.tags = ["SModes"];
// func.dependencies = ["Admin", "Oracle", "Upgrade"];
