import {HardhatRuntimeEnvironment} from "hardhat/types";
import {getNetworkName} from "hardhat-deploy/dist/src/utils";
import {deploy, updateValue, execute} from "./deployContracts";
import {loadConfig, Config} from "../configs/loader";
import {Deployment} from "hardhat-deploy/types";
import {ethers} from "hardhat";

export type Pool = "lending" | "vault";

const POOLS: Record<Pool, {controller: string; iTokenConfigs: string}> = {
  lending: {
    controller: "controller", // name of the controller instance
    iTokenConfigs: "iTokenConfigs", // name of the iToken configs in the config
  },
  vault: {
    controller: "vaultController", // name of the controller instance
    iTokenConfigs: "vaultTokenConfigs", // name of the iToken configs in the config
  },
};

export async function addMarkets(
  hre: HardhatRuntimeEnvironment,
  pool: Pool = "lending"
) {
  const {deployments, getNamedAccounts, ethers} = hre;
  const {read, log} = deployments;
  const {owner} = await getNamedAccounts();

  const iTokenConfigs = (await loadConfig(getNetworkName(hre.network)))[
    POOLS[pool].iTokenConfigs as keyof Config
  ] as Config["iTokenConfigs"];

  const controller = POOLS[pool].controller;

  for (let iToken in iTokenConfigs) {
    const iTokenConfig = iTokenConfigs[iToken];
    const iTokenProxy = await deployments.get(iToken);

    let hasiToken = await read(controller, "hasiToken", iTokenProxy.address);
    if (!hasiToken) {
      log("Going to add market for ", iToken);
      await execute(hre, controller, "owner", "_addMarketV2", {
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
        _sModeID: iTokenConfig.sModeID,
        _sModeLtv: ethers.parseEther(iTokenConfig.sModeLtv),
        _sModeLiqThreshold: ethers.parseEther(iTokenConfig.sModeLiqThreshold),
        _liquidationThreshold: ethers.parseEther(
          iTokenConfig.liquidationThreshold
        ),
        _debtCeiling: ethers.parseUnits(iTokenConfig.debtCeiling, 0),
        _borrowableInSegregation: iTokenConfig.borrowableInSegregation,
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
  const {read, log} = deployments;

  const {iTokenConfigs, timeLockStrategyConfigs} = await loadConfig(
    getNetworkName(hre.network)
  );

  // Should set limit config for all iTokens
  for (let iToken in iTokenConfigs) {
    const iTokenInstance = await deployments.get(iToken);
    const iTokenConfig = iTokenConfigs[iToken];

    const currentConfig = await read(
      "timeLockStrategy",
      "assetLimitConfig",
      iTokenInstance.address
    );

    const config = {
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
    };

    // read of hardhat-deploy uses ethers v5, which returns BigNumer,
    // while hardhat now use ethers v6, which is BigInt
    // to use == instead of ===
    if (
      currentConfig.minSingleLimit != config.minSingleLimit ||
      currentConfig.midSingleLimit != config.midSingleLimit ||
      currentConfig.minDailyLimit != config.minDailyLimit ||
      currentConfig.midDailyLimit != config.midDailyLimit
    ) {
      log(
        "Config changes, going to set",
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
        config
      );
    }
  }

  // Optional if we have whitelist
  if (timeLockStrategyConfigs.hasOwnProperty("whitelist")) {
    for (const wlAccount in timeLockStrategyConfigs.whitelist) {
      const wlConfig = timeLockStrategyConfigs.whitelist[wlAccount];
      for (const iToken in wlConfig) {
        const iTokenInstance = await deployments.get(iToken);
        const iTokenConfig = iTokenConfigs[iToken];

        const curConfig = await read(
          "timeLockStrategy",
          "whitelistExtra",
          iTokenInstance.address,
          wlAccount
        );

        const config = {
          minSingleLimit: ethers.parseUnits(
            wlConfig[iToken].minSingleLimit,
            iTokenConfig.iTokenDecimals
          ),
          midSingleLimit: ethers.parseUnits(
            wlConfig[iToken].midSingleLimit,
            iTokenConfig.iTokenDecimals
          ),
          minDailyLimit: ethers.parseUnits(
            wlConfig[iToken].minDailyLimit,
            iTokenConfig.iTokenDecimals
          ),
          midDailyLimit: ethers.parseUnits(
            wlConfig[iToken].midDailyLimit,
            iTokenConfig.iTokenDecimals
          ),
        };

        if (
          curConfig.minSingleLimit != config.minSingleLimit ||
          curConfig.midSingleLimit != config.midSingleLimit ||
          curConfig.minDailyLimit != config.minDailyLimit ||
          curConfig.midDailyLimit != config.midDailyLimit
        ) {
          log(
            "Config changes, going to set",
            iToken,
            "whitelist extra configs in the time lock strategy",
            "\n"
          );

          await execute(
            hre,
            "timeLockStrategy",
            "owner",
            "_setWhitelistExtraConfig",
            iTokenInstance.address,
            wlAccount,
            config
          );
        }
      }
    }
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

    try {
      // Ignore _Impl/_Proxy and excludes
      if (
        contract.includes("_Impl") ||
        contract.includes("_Proxy") ||
        excludes.includes(contract)
      )
        continue;

      const owner = await read(contract, "owner");
      if (owner === timelock.address) {
        continue;
      }

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
      if (e instanceof Error && e.message.includes("no method named")) {
        log("Skipping", contract, ", Error:", e.message);
        continue;
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

  if (config.contractName.includes("iETHV2")) {
    initArgs = [
      config.iTokenName,
      config.iTokenSymbol,
      controller.address,
      interestModel.address,
    ];
  } else if (config.contractName.includes("iTokenV2")) {
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
      "owner",
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
      "owner",
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

export async function setupSModes(
  hre: HardhatRuntimeEnvironment,
  owner: string,
  sModeConfigs: any[]
) {
  const {deployments, ethers} = hre;
  const {read, log} = deployments;

  let allSModeLength = Number(await read("controller", "getSModeLength"));
  log("Current sMode length : ", allSModeLength);
  for (let sModeIndex in sModeConfigs) {
    const sModeConfig = sModeConfigs[sModeIndex];
    let hasSMode = false;
    for (let i = 0; i < allSModeLength; i++) {
      const sModeDetails = await read("controller", "sModes", i);
      if (sModeConfig.label == sModeDetails.label) {
        hasSMode = true;

        if (
          !sModeDetails.liquidationIncentive.eq(
            ethers.parseEther(sModeConfig.liquidationIncentive)
          )
        ) {
          await execute(
            hre,
            "controller",
            owner,
            "_setSModeLiquidationIncentive",
            i,
            ethers.parseEther(sModeConfig.liquidationIncentive)
          );
        }

        if (
          !sModeDetails.closeFactor.eq(
            ethers.parseEther(sModeConfig.closeFactor)
          )
        ) {
          await execute(
            hre,
            "controller",
            owner,
            "_setSModeCloseFactor",
            i,
            ethers.parseEther(sModeConfig.closeFactor)
          );
        }
        break;
      }
    }

    if (!hasSMode) {
      console.log("Going to add sMode ", sModeConfig.label);
      await execute(
        hre,
        "controller",
        owner,
        "_addSMode",
        ethers.parseEther(sModeConfig.liquidationIncentive),
        ethers.parseEther(sModeConfig.closeFactor),
        sModeConfig.label
      );
    }
  }
  allSModeLength = Number(await read("controller", "getSModeLength"));
  log("After contract sMode length is: ", allSModeLength, "\n");
}

export async function updateiTokenConfig(
  hre: HardhatRuntimeEnvironment,
  owner: string,
  iTokenAddr: string,
  iTokenConfig: any
) {
  const {deployments, ethers} = hre;
  const {read, log} = deployments;

  const marketV2 = await read("controller", "marketsV2", iTokenAddr);

  // SMode
  const curSMode = marketV2.sModeID;
  log("current SMode", curSMode);
  if (curSMode !== Number(iTokenConfig.sModeID)) {
    await execute(
      hre,
      "controller",
      owner,
      "_setSMode",
      iTokenAddr,
      iTokenConfig.sModeID,
      ethers.parseEther(iTokenConfig.sModeLtv),
      ethers.parseEther(iTokenConfig.sModeLiqThreshold)
    );
  }

  // borrowable in segregation
  const borrowableInSegregation = marketV2.borrowableInSegregation;
  if (borrowableInSegregation !== iTokenConfig.borrowableInSegregation) {
    await execute(
      hre,
      "controller",
      owner,
      "_setBorrowableInSegregation",
      iTokenAddr,
      iTokenConfig.borrowableInSegregation
    );
  }

  // Liquidation Threshold
  await updateValue(
    hre,
    "controller",
    "owner",
    "getLiquidationThreshold",
    [iTokenAddr],
    ethers.parseEther(iTokenConfig.liquidationThreshold),
    "_setLiquidationThreshold",
    [iTokenAddr]
  );
}
