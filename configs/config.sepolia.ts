import {ethers} from "hardhat";

export const eModeConfigs: any = [
  {
    liquidationIncentive: "1.03",
    closeFactor: "0.3",
    label: "StableCoins",
  },
  {
    liquidationIncentive: "1.03",
    closeFactor: "0.3",
    label: "ETH",
  },
];

export const msdTokenConfigs: any = {
  USX: {
    name: "dForce USD",
    symbol: "USX",
    decimals: 18,
  },
};

export const controllerConfigs: any = {
  closeFactor: "0.5",
  liquidationIncentive: "1.07",
  pauseGuardian: "0x6b29b8af9AF126170513AE6524395E09025b214E",
};

export const iTokenConfigs: any = {
  iWBTC: {
    // iToken config
    iTokenUnderlyingAddress: "0x25503b21b631C85E88Dd4b6b55eac52f9672399C",
    iTokenName: "dForce WBTC",
    iTokenSymbol: "iWBTC",
    iTokenDecimals: 8,
    contractName: "iTokenV2",
    reserveRatio: "0.2",
    flashloanFeeRatio: "0.0004",
    protocolFeeRatio: "0.3",
    // oracle config
    price: "1",
    // controller config
    collateralFactor: "0.8",
    liquidationThreshold: "0.82",
    borrowFactor: "1",
    supplyCapacity: "10000",
    borrowCapacity: "10000",
    distributionFactor: "1",
    eModeID: "0",
    eModeLtv: "0.8",
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
    supplyCapacity: "100000",
    borrowCapacity: "100000",
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
    iTokenUnderlyingAddress: "0xEB50F151484A64b972747f31E6483C6463e32cc1",
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
  iUSDT: {
    // iToken config
    iTokenUnderlyingAddress: "0x778d20CE2f51B3b882b76b8268F32F6211E69834",
    iTokenName: "dForce USDT",
    iTokenSymbol: "iUSDT",
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
  iDAI: {
    // iToken config
    iTokenUnderlyingAddress: "0x64Ea4B0B4363Fc053B073Be3ec83448Aa4035aFc",
    iTokenName: "dForce DAI",
    iTokenSymbol: "iDAI",
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
  iUSX: {
    // iToken config
    iTokenUnderlyingAddress: "USX",
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
  iUNI: {
    // iToken config
    iTokenUnderlyingAddress: "0x7e7e6f65F32C6b39d2dD135F4b62646d9e2DAf17",
    iTokenName: "dForce UNI",
    iTokenSymbol: "iUNI",
    iTokenDecimals: 18,
    contractName: "iTokenV2",
    reserveRatio: "0.10",
    flashloanFeeRatio: "0.0004",
    protocolFeeRatio: "0.3",
    // oracle config
    price: "1",
    // controller config
    collateralFactor: "0.7",
    liquidationThreshold: "0.72",
    borrowFactor: "1",
    supplyCapacity: "1000000",
    borrowCapacity: "1000000",
    distributionFactor: "1",
    eModeID: "0",
    eModeLtv: "0.7",
    eModeLiqThreshold: "0.72",
    debtCeiling: "0",
    borrowableInIsolation: false,
    // interest model config
    interestModel: "MainSecondaryInterestSecondModel",
  },
  // deprecated iUNI for wrong underlying address, but need to set interest rate model when upgrading
  iUNId: {
    // iToken config
    iTokenUnderlyingAddress: "0x64Ea4B0B4363Fc053B073Be3ec83448Aa4035aFc",
    iTokenName: "dForce UNI",
    iTokenSymbol: "iUNI",
    iTokenDecimals: 18,
    contractName: "iTokenV2",
    reserveRatio: "0.10",
    flashloanFeeRatio: "0.0004",
    protocolFeeRatio: "0.3",
    // oracle config
    price: "1",
    // controller config
    collateralFactor: "0.7",
    liquidationThreshold: "0.72",
    borrowFactor: "1",
    supplyCapacity: "1000000",
    borrowCapacity: "1000000",
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
    iTokenUnderlyingAddress: "0x4ed818eDd4a0c36A3F43826A60630879b8164401",
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
  istETH: {
    // iToken config
    iTokenUnderlyingAddress: "0xEEAd4d4e539A8c63fC9c0Cc66c29e6bD54425A51",
    iTokenName: "dForce stETH",
    iTokenSymbol: "istETH",
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
    borrowCapacity: "20000",
    distributionFactor: "1",
    eModeID: "2",
    eModeLtv: "0.9",
    eModeLiqThreshold: "0.92",
    debtCeiling: "0",
    borrowableInIsolation: false,
    // interest model config
    interestModel: "MainPrimaryInterestSecondModel",
  },
  iARB: {
    // iToken config
    iTokenUnderlyingAddress: "0x826dC9032A77D4442EaF6a2f2D3FAa21b1042BE2",
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
    debtCeiling: "300000000",
    borrowableInIsolation: false,
    // interest model config
    interestModel: "MainSecondaryInterestSecondModel",
  },
  iMAI: {
    // iToken config
    iTokenUnderlyingAddress: "0x4AC85451c974cF297e4Cf754036Dcc01182e1694",
    iTokenName: "dForce MAI",
    iTokenSymbol: "iMAI",
    iTokenDecimals: 18,
    contractName: "iTokenV2",
    reserveRatio: "0.15",
    flashloanFeeRatio: "0.0004",
    protocolFeeRatio: "0.3",
    // oracle config
    price: "1",
    // controller config
    collateralFactor: "0.85",
    liquidationThreshold: "0.87",
    borrowFactor: "1",
    supplyCapacity: "10000000",
    borrowCapacity: "10000000",
    distributionFactor: "1",
    eModeID: "1",
    eModeLtv: "0.9",
    eModeLiqThreshold: "0.92",
    debtCeiling: "100000000",
    borrowableInIsolation: false,
    // interest model config
    interestModel: "StablePrimaryInterestSecondModel",
  },
  irETH: {
    // iToken config
    iTokenUnderlyingAddress: "0xD9AcB99bD76255397772deBc7Af6Cc2AD095E116",
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
    collateralFactor: "0.82",
    liquidationThreshold: "0.84",
    borrowFactor: "1",
    supplyCapacity: "20000",
    borrowCapacity: "20000",
    distributionFactor: "1",
    eModeID: "2",
    eModeLtv: "0.9",
    eModeLiqThreshold: "0.92",
    debtCeiling: "500000000",
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
  iUSDT: {
    minSingleLimit: "10000",
    midSingleLimit: "100000",
    minDailyLimit: "100000",
    midDailyLimit: "1000000",
  },
  iDAI: {
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
  iUNI: {
    minSingleLimit: "10000",
    midSingleLimit: "100000",
    minDailyLimit: "100000",
    midDailyLimit: "1000000",
  },
  iUNId: {
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
  istETH: {
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
  iMAI: {
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
