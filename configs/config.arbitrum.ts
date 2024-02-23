import {ethers} from "hardhat";

export const eModeConfigs: any = [
  {
    liquidationIncentive: "1.01",
    closeFactor: "0.5",
    label: "StableCoins",
  },
  {
    liquidationIncentive: "1.01",
    closeFactor: "0.5",
    label: "ETH",
  },
];

export const msdTokenConfigs: any = {
  USX: {
    name: "dForce USD",
    symbol: "USX",
    decimals: 18,
  },
  EUX: {
    name: "dForce EUR",
    symbol: "EUX",
    decimals: 18,
  },
};

export const controllerConfigs: any = {
  closeFactor: "0.5",
  liquidationIncentive: "1.07",
  pauseGuardian: "0x491C366614b971596cFf5570665DD9d24966de49",
};

export const iTokenConfigs: any = {
  iWBTC: {
    // iToken config
    iTokenUnderlyingAddress: "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f",
    iTokenName: "dForce WBTC",
    iTokenSymbol: "iWBTC",
    iTokenDecimals: 8,
    contractName: "iTokenV2",
    reserveRatio: "0.20",
    flashloanFeeRatio: "0.0004",
    protocolFeeRatio: "0.3",
    // oracle config
    price: "1",
    // controller config
    collateralFactor: "0.80",
    liquidationThreshold: "0.82",
    borrowFactor: "1",
    supplyCapacity: "3000",
    borrowCapacity: "3000",
    distributionFactor: "1",
    eModeID: "0",
    eModeLtv: "0.82",
    eModeLiqThreshold: "0.82",
    debtCeiling: "0",
    borrowableInIsolation: false,
    // interest model config
    interestModel: "MainPrimaryInterestSecondModel",
  },
  iETH: {
    // iToken config
    iTokenUnderlyingAddress: "0x0000000000000000000000000000000000000000",
    iTokenName: "dForce ETH",
    iTokenSymbol: "iETH",
    iTokenDecimals: 18,
    contractName: "iETHV2",
    reserveRatio: "0.15",
    flashloanFeeRatio: "0.0004",
    protocolFeeRatio: "0.3",
    // oracle config
    price: "1",
    // controller config
    collateralFactor: "0.85",
    liquidationThreshold: "0.87",
    borrowFactor: "1",
    supplyCapacity: "40000",
    borrowCapacity: "40000",
    distributionFactor: "1",
    eModeID: "2",
    eModeLtv: "0.9",
    eModeLiqThreshold: "0.92",
    debtCeiling: "0",
    borrowableInIsolation: false,
    // interest model config
    interestModel: "MainPrimaryInterestSecondModel",
  },
  iUSDC: {
    // iToken config
    iTokenUnderlyingAddress: "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
    iTokenName: "dForce USDC",
    iTokenSymbol: "iUSDC",
    iTokenDecimals: 6,
    contractName: "iTokenV2",
    reserveRatio: "0.10",
    flashloanFeeRatio: "0.0004",
    protocolFeeRatio: "0.3",
    // oracle config
    price: "1",
    // controller config
    collateralFactor: "0.85",
    liquidationThreshold: "0.87",
    borrowFactor: "1",
    supplyCapacity: "50000000",
    borrowCapacity: "50000000",
    distributionFactor: "1",
    eModeID: "1",
    eModeLtv: "0.9",
    eModeLiqThreshold: "0.92",
    debtCeiling: "0",
    borrowableInIsolation: true,
    // interest model config
    interestModel: "StablePrimaryInterestSecondModel",
  },
  iUSX: {
    // iToken config
    iTokenUnderlyingAddress: "0x641441c631e2f909700d2f41fd87f0aa6a6b4edb",
    iTokenName: "dForce USD",
    iTokenSymbol: "iUSX",
    iTokenDecimals: 18,
    contractName: "iTokenV2",
    reserveRatio: "0.10",
    flashloanFeeRatio: "0.0004",
    protocolFeeRatio: "0.3",
    // oracle config
    price: "1",
    // controller config
    collateralFactor: "0.85",
    liquidationThreshold: "0.87",
    borrowFactor: "1",
    supplyCapacity: "30000000",
    borrowCapacity: "30000000",
    distributionFactor: "1",
    eModeID: "1",
    eModeLtv: "0.9",
    eModeLiqThreshold: "0.92",
    debtCeiling: "0",
    borrowableInIsolation: true,
    // interest model config
    interestModel: "StablePrimaryInterestSecondModel",
  },
  iEUX: {
    // iToken config
    iTokenUnderlyingAddress: "0xc2125882318d04d266720b598d620f28222f3abd",
    iTokenName: "dForce EUR",
    iTokenSymbol: "iEUX",
    iTokenDecimals: 18,
    contractName: "iTokenV2",
    reserveRatio: "0.10",
    flashloanFeeRatio: "0.0004",
    protocolFeeRatio: "0.3",
    // oracle config
    price: "1",
    // controller config
    collateralFactor: "0.8",
    liquidationThreshold: "0.82",
    borrowFactor: "1",
    supplyCapacity: "20000000",
    borrowCapacity: "20000000",
    distributionFactor: "1",
    eModeID: "0",
    eModeLtv: "0.8",
    eModeLiqThreshold: "0.82",
    debtCeiling: "0",
    borrowableInIsolation: false,
    // interest model config
    interestModel: "StablePrimaryInterestSecondModel",
  },
  iMUSX: {
    // iToken config
    iTokenUnderlyingAddress: "0x641441c631e2f909700d2f41fd87f0aa6a6b4edb",
    iTokenName: "dForce USD",
    iTokenSymbol: "iMUSX",
    iTokenDecimals: 18,
    contractName: "iMSDV2",
    reserveRatio: "1",
    flashloanFeeRatio: "0.0004",
    protocolFeeRatio: "0.3",
    // oracle config
    price: "1",
    // controller config
    collateralFactor: "0.8",
    liquidationThreshold: "0.82",
    borrowFactor: "1",
    supplyCapacity: "0",
    borrowCapacity: "0",
    distributionFactor: "1",
    eModeID: "0",
    eModeLtv: "0.8",
    eModeLiqThreshold: "0.82",
    debtCeiling: "0",
    borrowableInIsolation: false,
    // interest model config
    interestModel: "FixedInterestRateSecondModelV2",
  },
  iMEUX: {
    // iToken config
    iTokenUnderlyingAddress: "0xc2125882318d04d266720b598d620f28222f3abd",
    iTokenName: "dForce EUR",
    iTokenSymbol: "iEUX",
    iTokenDecimals: 18,
    contractName: "iMSDV2",
    reserveRatio: "1",
    flashloanFeeRatio: "0.0004",
    protocolFeeRatio: "0.3",
    // oracle config
    price: "1",
    // controller config
    collateralFactor: "0.8",
    liquidationThreshold: "0.82",
    borrowFactor: "1",
    supplyCapacity: "0",
    borrowCapacity: "0",
    distributionFactor: "1",
    eModeID: "0",
    eModeLtv: "0.8",
    eModeLiqThreshold: "0.82",
    debtCeiling: "0",
    borrowableInIsolation: false,
    // interest model config
    interestModel: "FixedInterestRateSecondModelV2",
  },
  iUSDT: {
    // iToken config
    iTokenUnderlyingAddress: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
    iTokenName: "dForce USDT",
    iTokenSymbol: "iUSDT",
    iTokenDecimals: 6,
    contractName: "iTokenV2",
    reserveRatio: "0.1",
    flashloanFeeRatio: "0.0004",
    protocolFeeRatio: "0.3",
    // oracle config
    price: "1",
    // controller config
    collateralFactor: "0.85",
    liquidationThreshold: "0.87",
    borrowFactor: "1",
    supplyCapacity: "50000000",
    borrowCapacity: "50000000",
    distributionFactor: "1",
    eModeID: "1",
    eModeLtv: "0.9",
    eModeLiqThreshold: "0.92",
    debtCeiling: "0",
    borrowableInIsolation: true,
    // interest model config
    interestModel: "StablePrimaryInterestSecondModel",
  },
  iUNI: {
    // iToken config
    iTokenUnderlyingAddress: "0xfa7f8980b0f1e64a2062791cc3b0871572f1f7f0",
    iTokenName: "dForce UNI",
    iTokenSymbol: "iUNI",
    iTokenDecimals: 18,
    contractName: "iTokenV2",
    reserveRatio: "0.15",
    flashloanFeeRatio: "0.0004",
    protocolFeeRatio: "0.3",
    // oracle config
    price: "1",
    // controller config
    collateralFactor: "0.7",
    liquidationThreshold: "0.72",
    borrowFactor: "1",
    supplyCapacity: "300000",
    borrowCapacity: "300000",
    distributionFactor: "1",
    eModeID: "0",
    eModeLtv: "0.7",
    eModeLiqThreshold: "0.72",
    debtCeiling: "0",
    borrowableInIsolation: false,
    // interest model config
    interestModel: "MainSecondaryInterestSecondModel",
  },
  iLINK: {
    // iToken config
    iTokenUnderlyingAddress: "0xf97f4df75117a78c1a5a0dbb814af92458539fb4",
    iTokenName: "dForce LINK",
    iTokenSymbol: "iLINK",
    iTokenDecimals: 18,
    contractName: "iTokenV2",
    reserveRatio: "0.15",
    flashloanFeeRatio: "0.0004",
    protocolFeeRatio: "0.3",
    // oracle config
    price: "1",
    // controller config
    collateralFactor: "0.7",
    liquidationThreshold: "0.72",
    borrowFactor: "1",
    supplyCapacity: "250000",
    borrowCapacity: "250000",
    distributionFactor: "1",
    eModeID: "0",
    eModeLtv: "0.7",
    eModeLiqThreshold: "0.72",
    debtCeiling: "0",
    borrowableInIsolation: false,
    // interest model config
    interestModel: "MainSecondaryInterestSecondModel",
  },
  iDF: {
    // iToken config
    iTokenUnderlyingAddress: "0xae6aab43c4f3e0cea4ab83752c278f8debaba689",
    iTokenName: "dForce DF",
    iTokenSymbol: "iDF",
    iTokenDecimals: 18,
    contractName: "iTokenV2",
    reserveRatio: "0.25",
    flashloanFeeRatio: "0.0004",
    protocolFeeRatio: "0.3",
    // oracle config
    price: "1",
    // controller config
    collateralFactor: "0.6",
    liquidationThreshold: "0.62",
    borrowFactor: "1",
    supplyCapacity: "50000000",
    borrowCapacity: "50000000",
    distributionFactor: "1",
    eModeID: "0",
    eModeLtv: "0.6",
    eModeLiqThreshold: "0.62",
    debtCeiling: "0",
    borrowableInIsolation: false,
    // interest model config
    interestModel: "MainSecondaryInterestSecondModel",
  },
  iDAI: {
    // iToken config
    iTokenUnderlyingAddress: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
    iTokenName: "dForce DAI",
    iTokenSymbol: "iDAI",
    iTokenDecimals: 18,
    contractName: "iTokenV2",
    reserveRatio: "0.10",
    flashloanFeeRatio: "0.0004",
    protocolFeeRatio: "0.3",
    // oracle config
    price: "1",
    // controller config
    collateralFactor: "0.85",
    liquidationThreshold: "0.87",
    borrowFactor: "1",
    supplyCapacity: "2500000",
    borrowCapacity: "2500000",
    distributionFactor: "1",
    eModeID: "1",
    eModeLtv: "0.90",
    eModeLiqThreshold: "0.92",
    debtCeiling: "0",
    borrowableInIsolation: true,
    // interest model config
    interestModel: "StablePrimaryInterestSecondModel",
  },
  iFRAX: {
    // iToken config
    iTokenUnderlyingAddress: "0x17fc002b466eec40dae837fc4be5c67993ddbd6f",
    iTokenName: "dForce FRAX",
    iTokenSymbol: "iFRAX",
    iTokenDecimals: 18,
    contractName: "iTokenV2",
    reserveRatio: "0.10",
    flashloanFeeRatio: "0.0004",
    protocolFeeRatio: "0.3",
    // oracle config
    price: "1",
    // controller config
    collateralFactor: "0.85",
    liquidationThreshold: "0.87",
    borrowFactor: "1",
    supplyCapacity: "30000000",
    borrowCapacity: "30000000",
    distributionFactor: "1",
    eModeID: "1",
    eModeLtv: "0.9",
    eModeLiqThreshold: "0.92",
    debtCeiling: "0",
    borrowableInIsolation: true,
    // interest model config
    interestModel: "StablePrimaryInterestSecondModel",
  },
  iAAVE: {
    // iToken config
    iTokenUnderlyingAddress: "0xba5ddd1f9d7f570dc94a51479a000e3bce967196",
    iTokenName: "dForce AAVE",
    iTokenSymbol: "iAAVE",
    iTokenDecimals: 18,
    contractName: "iTokenV2",
    reserveRatio: "0.15",
    flashloanFeeRatio: "0.0004",
    protocolFeeRatio: "0.3",
    // oracle config
    price: "1",
    // controller config
    collateralFactor: "0.7",
    liquidationThreshold: "0.72",
    borrowFactor: "1",
    supplyCapacity: "100000",
    borrowCapacity: "100000",
    distributionFactor: "1",
    eModeID: "0",
    eModeLtv: "0.7",
    eModeLiqThreshold: "0.72",
    debtCeiling: "0",
    borrowableInIsolation: false,
    // interest model config
    interestModel: "MainSecondaryInterestSecondModel",
  },
  iCRV: {
    // iToken config
    iTokenUnderlyingAddress: "0x11cdb42b0eb46d95f990bedd4695a6e3fa034978",
    iTokenName: "dForce CRV",
    iTokenSymbol: "iCRV",
    iTokenDecimals: 18,
    contractName: "iTokenV2",
    reserveRatio: "0.15",
    flashloanFeeRatio: "0.0004",
    protocolFeeRatio: "0.3",
    // oracle config
    price: "1",
    // controller config
    collateralFactor: "0.65",
    liquidationThreshold: "0.67",
    borrowFactor: "1",
    supplyCapacity: "5000000",
    borrowCapacity: "5000000",
    distributionFactor: "1",
    eModeID: "0",
    eModeLtv: "0.65",
    eModeLiqThreshold: "0.67",
    debtCeiling: "0",
    borrowableInIsolation: false,
    // interest model config
    interestModel: "MainSecondaryInterestSecondModel",
  },
  iwstETH: {
    // iToken config
    iTokenUnderlyingAddress: "0x5979d7b546e38e414f7e9822514be443a4800529",
    iTokenName: "dForce wstETH",
    iTokenSymbol: "iwstETH",
    iTokenDecimals: 18,
    contractName: "iTokenV2",
    reserveRatio: "0.15",
    flashloanFeeRatio: "0.0004",
    protocolFeeRatio: "0.3",
    // oracle config
    price: "1",
    // controller config
    collateralFactor: "0.82",
    liquidationThreshold: "0.84",
    borrowFactor: "1",
    supplyCapacity: "20000",
    borrowCapacity: "10000",
    distributionFactor: "1",
    eModeID: "2",
    eModeLtv: "0.92",
    eModeLiqThreshold: "0.94",
    debtCeiling: "0",
    borrowableInIsolation: false,
    // interest model config
    interestModel: "MainPrimaryInterestSecondModel",
  },
  iARB: {
    // iToken config
    iTokenUnderlyingAddress: "0x912ce59144191c1204e64559fe8253a0e49e6548",
    iTokenName: "dForce ARB",
    iTokenSymbol: "iARB",
    iTokenDecimals: 18,
    contractName: "iTokenV2",
    reserveRatio: "0.15",
    flashloanFeeRatio: "0.0004",
    protocolFeeRatio: "0.3",
    // oracle config
    price: "1",
    // controller config
    collateralFactor: "0.8",
    liquidationThreshold: "0.82",
    borrowFactor: "1",
    supplyCapacity: "10000000",
    borrowCapacity: "10000000",
    distributionFactor: "1",
    eModeID: "0",
    eModeLtv: "0.8",
    eModeLiqThreshold: "0.82",
    debtCeiling: "0",
    borrowableInIsolation: false,
    // interest model config
    interestModel: "MainSecondaryInterestSecondModel",
  },
  iUSDCn: {
    // iToken config
    iTokenUnderlyingAddress: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
    iTokenName: "dForce USDC Native",
    iTokenSymbol: "iUSDCn",
    iTokenDecimals: 6,
    contractName: "iTokenV2",
    reserveRatio: "0.10",
    flashloanFeeRatio: "0.0004",
    protocolFeeRatio: "0.3",
    // oracle config
    price: "1",
    // controller config
    collateralFactor: "0.85",
    liquidationThreshold: "0.87",
    borrowFactor: "1",
    supplyCapacity: "50000000",
    borrowCapacity: "50000000",
    distributionFactor: "1",
    eModeID: "1",
    eModeLtv: "0.9",
    eModeLiqThreshold: "0.92",
    debtCeiling: "0",
    borrowableInIsolation: true,
    // interest model config
    interestModel: "StablePrimaryInterestSecondModel",
  },
  irETH: {
    // iToken config
    iTokenUnderlyingAddress: "0xec70dcb4a1efa46b8f2d97c310c9c4790ba5ffa8",
    iTokenName: "dForce rETH",
    iTokenSymbol: "irETH",
    iTokenDecimals: 18,
    contractName: "iTokenV2",
    reserveRatio: "0.15",
    flashloanFeeRatio: "0.0004",
    protocolFeeRatio: "0.3",
    // oracle config
    price: "1",
    // controller config
    collateralFactor: "0.7",
    liquidationThreshold: "0.72",
    borrowFactor: "1",
    supplyCapacity: "1500",
    borrowCapacity: "1000",
    distributionFactor: "1",
    eModeID: "2",
    eModeLtv: "0.9",
    eModeLiqThreshold: "0.92",
    debtCeiling: "0",
    borrowableInIsolation: false,
    // interest model config
    interestModel: "MainPrimaryInterestSecondModel",
  },
};

// NOTICE: SHOULD KEEP
export const timeLockStrategyConfigs: any = {
  // Strategy config
  minSingleWaitSeconds: 0,
  midSingleWaitSeconds: 60,
  maxSingleWaitSeconds: 300,
  minDailyWaitSeconds: 0,
  midDailyWaitSeconds: 120,
  maxDailyWaitSeconds: 600,
  iWBTC: {
    minSingleLimit: "1",
    midSingleLimit: "10",
    minDailyLimit: "100",
    midDailyLimit: "1000",
  },
  iETH: {
    minSingleLimit: "10",
    midSingleLimit: "100",
    minDailyLimit: "1000",
    midDailyLimit: "10000",
  },
  iUSDC: {
    minSingleLimit: "10000",
    midSingleLimit: "100000",
    minDailyLimit: "100000",
    midDailyLimit: "1000000",
  },
  iUSX: {
    minSingleLimit: "10000",
    midSingleLimit: "100000",
    minDailyLimit: "100000",
    midDailyLimit: "1000000",
  },
  iEUX: {
    minSingleLimit: "10000",
    midSingleLimit: "100000",
    minDailyLimit: "100000",
    midDailyLimit: "1000000",
  },
  iMUSX: {
    minSingleLimit: "10000",
    midSingleLimit: "100000",
    minDailyLimit: "100000",
    midDailyLimit: "1000000",
  },
  iMEUX: {
    minSingleLimit: "10000",
    midSingleLimit: "100000",
    minDailyLimit: "100000",
    midDailyLimit: "1000000",
  },
  iUSDT: {
    minSingleLimit: "10000",
    midSingleLimit: "100000",
    minDailyLimit: "100000",
    midDailyLimit: "1000000",
  },
  iUNI: {
    minSingleLimit: "10000",
    midSingleLimit: "100000",
    minDailyLimit: "100000",
    midDailyLimit: "1000000",
  },
  iLINK: {
    minSingleLimit: "10000",
    midSingleLimit: "100000",
    minDailyLimit: "100000",
    midDailyLimit: "1000000",
  },
  iDF: {
    minSingleLimit: "1000000",
    midSingleLimit: "10000000",
    minDailyLimit: "100000000",
    midDailyLimit: "100000000",
  },
  iDAI: {
    minSingleLimit: "10000",
    midSingleLimit: "100000",
    minDailyLimit: "100000",
    midDailyLimit: "1000000",
  },
  iFRAX: {
    minSingleLimit: "10000",
    midSingleLimit: "100000",
    minDailyLimit: "100000",
    midDailyLimit: "1000000",
  },
  iAAVE: {
    minSingleLimit: "10000",
    midSingleLimit: "100000",
    minDailyLimit: "100000",
    midDailyLimit: "1000000",
  },
  iCRV: {
    minSingleLimit: "10000",
    midSingleLimit: "100000",
    minDailyLimit: "100000",
    midDailyLimit: "1000000",
  },
  iwstETH: {
    minSingleLimit: "10",
    midSingleLimit: "100",
    minDailyLimit: "1000",
    midDailyLimit: "10000",
  },
  iARB: {
    minSingleLimit: "10000",
    midSingleLimit: "100000",
    minDailyLimit: "100000",
    midDailyLimit: "1000000",
  },
  iUSDCn: {
    minSingleLimit: "10000",
    midSingleLimit: "100000",
    minDailyLimit: "100000",
    midDailyLimit: "1000000",
  },
  irETH: {
    minSingleLimit: "10",
    midSingleLimit: "100",
    minDailyLimit: "1000",
    midDailyLimit: "10000",
  },
};
