import {DeployOptions} from "hardhat-deploy/dist/types";
import {HardhatRuntimeEnvironment} from "hardhat/types";
import {Interface, FunctionFragment, Fragment} from "@ethersproject/abi";
import * as readline from "readline/promises";
import {BaseContractMethod, ContractTransaction, Transaction} from "ethers";
import {Timelock} from "../typechain-types";

export async function deploy(
  hre: HardhatRuntimeEnvironment,
  instanceName: string,
  contractName: string = instanceName,
  constructorArgs?: any[],
  proxy?: boolean,
  initFunction?: string,
  initArgs?: any[],
  initImplementation: boolean = true
) {
  const {deployments, getNamedAccounts} = hre;
  const {deploy, execute, read, log} = deployments;
  const {deployer} = await getNamedAccounts();

  let options: DeployOptions = {
    from: deployer,
    contract: contractName,
    args: constructorArgs,
    log: true,
    // skipIfAlreadyDeployed: true,
  };

  if (proxy) {
    const implementationName = contractName + "_Impl";

    const proxyAdminOwner = await read("proxyAdmin", "owner()");
    const timelock = await deployments.get("timelock");

    if (proxyAdminOwner !== deployer && proxyAdminOwner !== timelock.address) {
      throw new Error("Wrong proxyAdmin!");
    }

    options.proxy = {
      owner: proxyAdminOwner,
      proxyContract: "TransparentUpgradeableProxy",
      viaAdminContract: {name: "proxyAdmin"},
      implementationName: implementationName,
    };

    if (initFunction) {
      options.proxy.execute = {
        init: {
          methodName: initFunction, // method to be executed when the proxy is deployed
          args: initArgs,
        },
      };
    }

    const beforeImpl = await deployments.getOrNull(implementationName);

    const contract = await deploy(instanceName, options);

    // Call init function in implementation if it is newly deployed
    if (!beforeImpl && initImplementation && initFunction && initArgs) {
      await execute(
        implementationName,
        {from: deployer, log: true},
        initFunction,
        ...initArgs
      );
    }

    return contract;
  } else {
    return await deploy(instanceName, options);
  }
}

export async function upgrade(
  hre: HardhatRuntimeEnvironment,
  instanceName: string,
  contractName: string,
  implementationName: string,
  constructorArgs?: any[],
  initFunction?: string,
  initArgs?: any[],
  initImplementation: boolean = true
) {
  const {deployments, getNamedAccounts} = hre;
  const {deploy, execute, read, log} = deployments;
  const {deployer} = await getNamedAccounts();

  let options: DeployOptions = {
    from: deployer,
    contract: contractName,
    args: constructorArgs,
    log: true,
    // skipIfAlreadyDeployed: true,
  };

  const proxyAdminOwner = await read("proxyAdmin", "owner()");
  const timelock = await deployments.get("timelock");

  if (proxyAdminOwner !== deployer && proxyAdminOwner !== timelock.address) {
    throw new Error("Wrong proxyAdmin!");
  }

  options.proxy = {
    owner: proxyAdminOwner,
    proxyContract: "TransparentUpgradeableProxy",
    viaAdminContract: {name: "proxyAdmin"},
    implementationName: implementationName,
  };

  const beforeImpl = await deployments.getOrNull(implementationName);

  const contract = await deploy(instanceName, options);

  // Call init function in implementation if it is newly deployed
  if (!beforeImpl && initImplementation && initFunction && initArgs) {
    await execute(
      implementationName,
      {from: deployer, log: true},
      initFunction,
      ...initArgs
    );
  }

  return contract;
}

export async function execute(
  hre: HardhatRuntimeEnvironment,
  name: string,
  from: string,
  method: string,
  ...args: any[]
) {
  const {deployments, ethers, getNamedAccounts} = hre;
  const {read, execute, log, catchUnknownSigner} = deployments;
  const {owner} = await getNamedAccounts();

  log(`Going to call ${name}.${method}(${args})`);

  let result;

  try {
    const targetOwner = await read(name, "owner");

    let targetContract = await ethers.getContract(name, targetOwner);
    let tx = (await targetContract[method].populateTransaction(
      ...args
    )) as ContractTransaction;

    if (from === "owner") {
      const timelock = await deployments.get("timelock");

      if (targetOwner === timelock.address) {
        // execute via timelock
        log("Executing via timelock...");

        const timelockOwner = await read("timelock", "owner");
        const signature =
          targetContract.interface.parseTransaction(tx)?.signature;
        const calldata = "0x" + tx.data.substr(10);

        const timelockContract = (await ethers.getContract(
          "timelock",
          timelockOwner
        )) as Timelock;

        tx = (await timelockContract.executeTransaction.populateTransaction(
          targetContract.target,
          0,
          signature,
          calldata
        )) as ContractTransaction;

        name = "timelock";
        from = timelockOwner;
        method = "executeTransaction";
        args = [targetContract.target, 0, signature, calldata];
      } else {
        log("impersonating target owner...");

        from = targetOwner;
      }
    }

    // Print tx data for multisig
    if (from === owner) {
      log("txData:", tx);
    }
  } catch (error) {
    console.error(error);
  }

  result = await catchUnknownSigner(
    execute(name, {from: from, log: true}, method, ...args)
  );

  // We have a UnknownSigner exception
  if (result) {
    await waitForContinue();
  }
}

export async function updateValue(
  hre: HardhatRuntimeEnvironment,
  target: string,
  from: string,
  getter: string,
  getterArgs: any[],
  value: any,
  setter: string,
  setterArgs: any[]
) {
  const {read, log} = hre.deployments;
  let currentValue = await read(target, getter, ...getterArgs);

  if (value != currentValue) {
    setterArgs.push(value);
    log(`Current value ${target}.${getter}(${getterArgs}): ${currentValue}`);
    log(`Going to call ${target}.${setter}(${setterArgs})`);
    await execute(hre, target, from, setter, ...setterArgs);
  } else {
    log(`Current value ${target}.${getter}(${getterArgs}): ${currentValue}`);
    log("skipping... ");
  }
}

async function waitForContinue() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    while (true) {
      // NOTE: the second parameter (the timeout) is optional.
      const answer = await rl.question("Press c to continue: ");

      switch (answer.toLowerCase()) {
        case "c":
          console.log("Continuing...");
          break;
        default:
          continue;
      }

      break;
    }
  } finally {
    rl.close();
  }
}
export async function getOwner(hre: HardhatRuntimeEnvironment, name: string) {
  const {deployments, ethers, getNamedAccounts} = hre;
  const {read, execute, log, catchUnknownSigner} = deployments;

  return await read(name, "owner");
}
