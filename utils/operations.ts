import {HardhatRuntimeEnvironment} from "hardhat/types";
import {getNetworkName} from "hardhat-deploy/dist/src/utils";
import {deploy, updateValue, execute} from "./deployContracts";
import {loadConfig} from "../configs/loader";
import {Deployment} from "hardhat-deploy/types";

export async function addMarkets(hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts, ethers} = hre;
  const {read, log} = deployments;
  const {owner} = await getNamedAccounts();
  const {iTokenConfigs} = await loadConfig(getNetworkName(hre.network));

  for (let iToken in iTokenConfigs) {
    const iTokenConfig = iTokenConfigs[iToken];
    const iTokenProxy = await deployments.get(iToken);

    let hasiToken = await read("controller", "hasiToken", iTokenProxy.address);
    if (!hasiToken) {
      log("Going to add market for ", iToken);
      await execute(hre, "controller", "owner", "_addMarketV2", {
        _iToken: iTokenProxy.address,
        _collateralFactor: ethers.parseEther(iTokenConfig.collateralFactor),
        _borrowFactor: ethers.parseEther(iTokenConfig.borrowFactor),
        _supplyCapacity: ethers.parseUnits(
          iTokenConfig.supplyCapacity,
          iTokenConfig.iTokenDecimals
        ),
        _borrowCapacity: ethers.parseUnits(
          iTokenConfig.borrowCapacity,
          iTokenConfig.iTokenDecimals
        ),
        _distributionFactor: ethers.parseEther(iTokenConfig.distributionFactor),
        _eModeID: iTokenConfig.eModeID,
        _eModeLtv: ethers.parseEther(iTokenConfig.eModeLtv),
        _eModeLiqThreshold: ethers.parseEther(iTokenConfig.eModeLiqThreshold),
        _liquidationThreshold: ethers.parseEther(
          iTokenConfig.liquidationThreshold
        ),
        _debtCeiling: ethers.parseUnits(iTokenConfig.debtCeiling, 0),
        _borrowableInIsolation: iTokenConfig.borrowableInIsolation,
      });

      hasiToken = await read("controller", "hasiToken", iTokenProxy.address);
      log(iToken, " has been added succesfully\n");
    } else {
      log(iToken, "\thas been already added");
    }
  }
}

export async function setTimeLockStrategyData(hre: HardhatRuntimeEnvironment) {
  const {deployments, ethers, network} = hre;

  // Sets limit configs for iToken
  const {iTokenConfigs, timeLockStrategyConfigs} = await loadConfig(
    getNetworkName(hre.network)
  );

  for (let iToken in iTokenConfigs) {
    const iTokenInstance = await deployments.get(iToken);
    const iTokenConfig = iTokenConfigs[iToken];

    // NOTICE: Maybe it is no need to do the following actions.
    deployments.log(
      "Going to set",
      iToken,
      "limit configs in the time lock strategy",
      "\n"
    );

    await execute(
      hre,
      "timeLockStrategy",
      "owner",
      "_setAssetLimitConfig",
      iTokenInstance.address,
      {
        minSingleLimit: ethers.parseUnits(
          timeLockStrategyConfigs[iToken].minSingleLimit,
          iTokenConfig.iTokenDecimals
        ),
        midSingleLimit: ethers.parseUnits(
          timeLockStrategyConfigs[iToken].midSingleLimit,
          iTokenConfig.iTokenDecimals
        ),
        minDailyLimit: ethers.parseUnits(
          timeLockStrategyConfigs[iToken].minDailyLimit,
          iTokenConfig.iTokenDecimals
        ),
        midDailyLimit: ethers.parseUnits(
          timeLockStrategyConfigs[iToken].midDailyLimit,
          iTokenConfig.iTokenDecimals
        ),
      }
    );
  }
}

export async function timelockExectuteTransactions(
  hre: HardhatRuntimeEnvironment,
  from: string,
  txs: {target: string; value: number; signature: string; args: any[]}[]
) {
  const {deployments, ethers} = hre;
  const {execute, log} = deployments;

  // extract the type from the signature
  function extractTypes(input: string): string[] {
    // Regular expression to match content within parentheses
    const regex = /\(([^)]+)\)/;
    const match = input.match(regex);

    // If match is found, split the content by comma
    if (match) {
      return match[1].split(",");
    } else {
      return []; // Return an empty array if no match is found
    }
  }

  const targets = txs.map((tx) => tx.target);
  const values = txs.map((tx) => tx.value);
  const signatures = txs.map((tx) => tx.signature);
  const calldatas = txs.map((tx) =>
    ethers.AbiCoder.defaultAbiCoder().encode(
      extractTypes(tx.signature),
      tx.args
    )
  );

  await execute(
    "timelock",
    {from: from, log: true},
    "executeTransactions",
    targets,
    values,
    signatures,
    calldatas
  );
}

export async function transferOwnershipToTimelock(
  hre: HardhatRuntimeEnvironment,
  from: string,
  timelockOwner: string,
  excludes: string[]
) {
  const {deployments} = hre;
  const {execute, read, log} = deployments;

  const all = await deployments.all();
  const timelock = await deployments.get("timelock");

  let txs = [];

  for (const contract in all) {
    // log(contract);

    // Ignore _Impl/_Proxy and excludes
    if (
      contract.includes("_Impl") ||
      contract.includes("_Proxy") ||
      excludes.includes(contract)
    )
      continue;

    try {
      await execute(
        contract,
        {from: from, log: true},
        "_setPendingOwner",
        timelock.address
      );

      txs.push({
        target: all[contract].address,
        value: 0,
        signature: "_acceptOwner()",
        args: [],
      });
    } catch (e) {
      // Ignore errors some contract does not have owner
      if (
        e instanceof Error &&
        e.message.includes('No method named "_setPendingOwner"')
      ) {
        log('No method named "_setPendingOwner" in ', contract, "Skipping!");
        continue;
      } else {
        throw e;
      }
    }
  }

  await timelockExectuteTransactions(hre, timelockOwner, txs);
}

// Only for testnet
export async function transferOwnershipFromTimelock(
  hre: HardhatRuntimeEnvironment,
  newOwner: string,
  timelockOwner: string,
  excludes: string[]
) {
  const {deployments} = hre;
  const {execute, read, log} = deployments;

  const all = await deployments.all();
  const timelock = await deployments.get("timelock");

  let txs = [];
  let toAccept = [];

  for (const contract in all) {
    // log(contract);

    // Ignore _Impl/_Proxy and excludes
    if (
      contract.includes("_Impl") ||
      contract.includes("_Proxy") ||
      excludes.includes(contract)
    )
      continue;

    try {
      if ((await read(contract, "owner")) === timelock.address) {
        txs.push({
          target: all[contract].address,
          value: 0,
          signature: "_setPendingOwner(address)",
          args: [newOwner],
        });

        toAccept.push(contract);
      }
    } catch (e) {
      log(e);
    }
  }

  await timelockExectuteTransactions(hre, timelockOwner, txs);

  for (const contract of toAccept) {
    await execute(contract, {from: newOwner, log: true}, "_acceptOwner()");
  }
}

export async function deployiToken(
  hre: HardhatRuntimeEnvironment,
  deployer: string,
  iToken: string,
  controller: Deployment,
  msdController: Deployment,
  config: any
) {
  const {deployments, ethers} = hre;

  let initArgs: any[];
  let isMSD = false;

  if (!config.iTokenUnderlyingAddress.startsWith("0x")) {
    config.iTokenUnderlyingAddress = (
      await deployments.get(config.iTokenUnderlyingAddress)
    ).address;
  }

  const interestModel = await deployments.get(config.interestModel);

  if (config.contractName == "iETHV2") {
    initArgs = [
      config.iTokenName,
      config.iTokenSymbol,
      controller.address,
      interestModel.address,
    ];
  } else if (config.contractName == "iTokenV2") {
    initArgs = [
      config.iTokenUnderlyingAddress,
      config.iTokenName,
      config.iTokenSymbol,
      controller.address,
      interestModel.address,
    ];
  } else {
    // iMSD
    initArgs = [
      config.iTokenUnderlyingAddress,
      config.iTokenName,
      config.iTokenSymbol,
      controller.address,
      interestModel.address,
      msdController.address,
    ];

    isMSD = true;
  }

  const iTokenContract = await deploy(
    hre,
    iToken,
    config.contractName,
    [],
    true,
    "initialize",
    initArgs
  );

  await updateValue(
    hre,
    iToken,
    deployer,
    "reserveRatio",
    [],
    ethers.parseEther(config.reserveRatio),
    "_setNewReserveRatio",
    []
  );

  if (isMSD) {
    // Add iMSD as a minter in msdController
    await execute(
      hre,
      "msdController",
      deployer,
      "_addMSD",
      config.iTokenUnderlyingAddress,
      [iTokenContract.address],
      [ethers.parseUnits(config.borrowCapacity, config.iTokenDecimals)]
    );

    // Set iMSD borrow rate
    const interestPerDay = Math.pow(config.APY, 1 / 365);
    const toUpdateBorrowRate = (
      ((interestPerDay - 1) * 10 ** 18) /
      (60 * 60 * 24)
    ).toFixed();
    await updateValue(
      hre,
      "FixedInterestRateSecondModelV2",
      deployer,
      "borrowRatesPerSecond",
      [iTokenContract.address],
      toUpdateBorrowRate,
      "_setBorrowRate",
      [iTokenContract.address]
    );
  }

  // Set price for local environment.
  if (!hre.network.live) {
    await updateValue(
      hre,
      "oracle",
      deployer,
      "getUnderlyingPrice",
      [iTokenContract.address],
      ethers.parseUnits(config.price, config.iTokenDecimals),
      "setPrice",
      [iTokenContract.address]
    );
  }
}

export async function setupEModes(
  hre: HardhatRuntimeEnvironment,
  owner: string,
  eModeConfigs: any[]
) {
  const {deployments, ethers} = hre;
  const {read, log} = deployments;

  let allEModeLength = Number(await read("controller", "getEModeLength"));
  log("Current eMode length : ", allEModeLength);
  for (let eModeIndex in eModeConfigs) {
    const eModeConfig = eModeConfigs[eModeIndex];
    let hasEMode = false;
    for (let i = 0; i < allEModeLength; i++) {
      const eModeDetails = await read("controller", "eModes", i);
      if (eModeConfig.label == eModeDetails.label) {
        hasEMode = true;

        if (
          eModeConfig.liquidationIncentive !== eModeDetails.liquidationIncentive
        ) {
          await execute(
            hre,
            "controller",
            owner,
            "_setEModeLiquidationIncentive",
            i,
            ethers.parseEther(eModeConfig.liquidationIncentive)
          );
        }

        if (eModeConfig.closeFactor !== eModeDetails.closeFactor) {
          await execute(
            hre,
            "controller",
            owner,
            "_setEModeCloseFactor",
            i,
            ethers.parseEther(eModeConfig.closeFactor)
          );
        }
        break;
      }
    }

    if (!hasEMode) {
      console.log("Going to add eMode ", eModeConfig.label);
      await execute(
        hre,
        "controller",
        owner,
        "_addEMode",
        ethers.parseEther(eModeConfig.liquidationIncentive),
        ethers.parseEther(eModeConfig.closeFactor),
        eModeConfig.label
      );
    }
  }
  allEModeLength = Number(await read("controller", "getEModeLength"));
  log("After contract eMode length is: ", allEModeLength, "\n");
}

export async function setiTokenEMode(
  hre: HardhatRuntimeEnvironment,
  owner: string,
  iTokenAddr: string,
  iTokenConfig: any
) {
  const {deployments, ethers} = hre;
  const {read, log} = deployments;

  const curEMode = (await read("controller", "marketsV2", iTokenAddr)).eModeID;

  log("current EMode", curEMode);

  if (curEMode !== Number(iTokenConfig.eModeID)) {
    await execute(
      hre,
      "controller",
      owner,
      "_setEMode",
      iTokenAddr,
      iTokenConfig.eModeID,
      ethers.parseEther(iTokenConfig.eModeLtv),
      ethers.parseEther(iTokenConfig.eModeLiqThreshold)
    );
  }
}
