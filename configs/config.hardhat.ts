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
  {
    liquidationIncentive: "1.01",
    closeFactor: "0.5",
    label: "BTC",
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
  pauseGuardian: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
};

export const iTokenConfigs: any = {
  iARB: {
    // iToken config
    iTokenUnderlyingAddress: "",
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
    collateralFactor: "0.5",
    liquidationThreshold: "0.55",
    borrowFactor: "1",
    supplyCapacity: "2500000",
    borrowCapacity: "2500000",
    distributionFactor: "1",
    eModeID: "0",
    eModeLtv: "0.5",
    eModeLiqThreshold: "0.55",
    debtCeiling: "10000000", // 100k
    borrowableInIsolation: false,
    // interest model config
    interestModel: "MainPrimaryInterestSecondModel",
  },
  iDAI: {
    // iToken config
    iTokenUnderlyingAddress: "",
    iTokenName: "dForce DAI",
    iTokenSymbol: "iDAI",
    iTokenDecimals: 18,
    contractName: "iTokenV2",
    reserveRatio: "0.15",
    flashloanFeeRatio: "0.0004",
    protocolFeeRatio: "0.3",
    // oracle config
    price: "1",
    // controller config
    collateralFactor: "0.8",
    liquidationThreshold: "0.83",
    borrowFactor: "1",
    supplyCapacity: "2500000",
    borrowCapacity: "2500000",
    distributionFactor: "1",
    eModeID: "1",
    eModeLtv: "0.9",
    eModeLiqThreshold: "0.93",
    debtCeiling: "0",
    borrowableInIsolation: true,
    // interest model config
    interestModel: "StablePrimaryInterestSecondModel",
  },
  iDF: {
    // iToken config
    iTokenUnderlyingAddress: "",
    iTokenName: "dForce DF",
    iTokenSymbol: "iDF",
    iTokenDecimals: 18,
    contractName: "iTokenV2",
    reserveRatio: "0.15",
    flashloanFeeRatio: "0.0004",
    protocolFeeRatio: "0.3",
    // oracle config
    price: "0.05",
    // controller config
    collateralFactor: "0.8",
    liquidationThreshold: "0.85",
    borrowFactor: "1",
    supplyCapacity: "2500000",
    borrowCapacity: "2500000",
    distributionFactor: "1",
    eModeID: "0",
    eModeLtv: "0.8",
    eModeLiqThreshold: "0.85",
    debtCeiling: "0",
    borrowableInIsolation: false,
    // interest model config
    interestModel: "MainPrimaryInterestSecondModel",
  },
  iETH: {
    // iToken config
    iTokenUnderlyingAddress: ethers.ZeroAddress,
    iTokenName: "dForce ETH",
    iTokenSymbol: "iETH",
    iTokenDecimals: 18,
    contractName: "iETHV2",
    reserveRatio: "0.15",
    flashloanFeeRatio: "0.0004",
    protocolFeeRatio: "0.3",
    // oracle config
    price: "1700",
    // controller config
    collateralFactor: "0.75",
    liquidationThreshold: "0.8",
    borrowFactor: "1",
    supplyCapacity: "250000",
    borrowCapacity: "250000",
    distributionFactor: "1",
    eModeID: "2",
    eModeLtv: "0.9",
    eModeLiqThreshold: "0.93",
    debtCeiling: "0",
    borrowableInIsolation: false,
    // interest model config
    interestModel: "ETHLikeInterestSecondModel",
  },
  iMEUX: {
    // iToken config
    iTokenUnderlyingAddress: "EUX",
    iTokenName: "dForce EUX",
    iTokenSymbol: "iMEUX",
    iTokenDecimals: 18,
    contractName: "iMSDV2",
    reserveRatio: "1",
    flashloanFeeRatio: "0.0004",
    protocolFeeRatio: "0.3",
    // oracle config
    price: "1.23",
    // controller config
    collateralFactor: "0.8",
    liquidationThreshold: "0.85",
    borrowFactor: "1",
    supplyCapacity: "2500000",
    borrowCapacity: "2500000",
    distributionFactor: "1",
    eModeID: "0",
    eModeLtv: "0.8",
    eModeLiqThreshold: "0.85",
    debtCeiling: "0",
    borrowableInIsolation: false,
    // MSD controller config
    minterCap: "5000000",
    // interest model config
    interestModel: "FixedInterestRateSecondModelV2",
    APY: 1.03,
  },
  iMUSX: {
    // iToken config
    iTokenUnderlyingAddress: "USX",
    iTokenName: "dForce USX",
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
    liquidationThreshold: "0.85",
    borrowFactor: "1",
    supplyCapacity: "2500000",
    borrowCapacity: "2500000",
    distributionFactor: "1",
    eModeID: "1",
    eModeLtv: "0.9",
    eModeLiqThreshold: "0.93",
    debtCeiling: "0",
    borrowableInIsolation: false,
    // MSD controller config
    minterCap: "5000000",
    // interest model config
    interestModel: "FixedInterestRateSecondModelV2",
    APY: 1.03,
  },
  iUNI: {
    // iToken config
    iTokenUnderlyingAddress: "",
    iTokenName: "dForce UNI",
    iTokenSymbol: "iUNI",
    iTokenDecimals: 18,
    contractName: "iTokenV2",
    reserveRatio: "0.15",
    flashloanFeeRatio: "0.0004",
    protocolFeeRatio: "0.3",
    // oracle config
    price: "4.5",
    // controller config
    collateralFactor: "0.7",
    liquidationThreshold: "0.75",
    borrowFactor: "1",
    supplyCapacity: "2500000",
    borrowCapacity: "2500000",
    distributionFactor: "1",
    eModeID: "0",
    eModeLtv: "0.7",
    eModeLiqThreshold: "0.75",
    debtCeiling: "0",
    borrowableInIsolation: false,
    // interest model config
    interestModel: "MainPrimaryInterestSecondModel",
  },
  iUSDC: {
    // iToken config
    iTokenUnderlyingAddress: "",
    iTokenName: "dForce USDC",
    iTokenSymbol: "iUSDC",
    iTokenDecimals: 6,
    contractName: "iTokenV2",
    reserveRatio: "0.15",
    flashloanFeeRatio: "0.0004",
    protocolFeeRatio: "0.3",
    // oracle config
    price: "1",
    // controller config
    collateralFactor: "0.8",
    liquidationThreshold: "0.83",
    borrowFactor: "1",
    supplyCapacity: "2500000",
    borrowCapacity: "2500000",
    distributionFactor: "1",
    eModeID: "1",
    eModeLtv: "0.9",
    eModeLiqThreshold: "0.93",
    debtCeiling: "0",
    borrowableInIsolation: true,
    // interest model config
    interestModel: "StablePrimaryInterestSecondModel",
  },
  iUSDT: {
    // iToken config
    iTokenUnderlyingAddress: "",
    iTokenName: "dForce USDT",
    iTokenSymbol: "iUSDT",
    iTokenDecimals: 6,
    contractName: "iTokenV2",
    reserveRatio: "0.15",
    flashloanFeeRatio: "0.0004",
    protocolFeeRatio: "0.3",
    // oracle config
    price: "1",
    // controller config
    collateralFactor: "0.8",
    liquidationThreshold: "0.83",
    borrowFactor: "1",
    supplyCapacity: "2500000",
    borrowCapacity: "2500000",
    distributionFactor: "1",
    eModeID: "1",
    eModeLtv: "0.9",
    eModeLiqThreshold: "0.93",
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
    reserveRatio: "0.15",
    flashloanFeeRatio: "0.0004",
    protocolFeeRatio: "0.3",
    // oracle config
    price: "1",
    // controller config
    collateralFactor: "0.8",
    liquidationThreshold: "0.83",
    borrowFactor: "1",
    supplyCapacity: "2500000",
    borrowCapacity: "2500000",
    distributionFactor: "1",
    eModeID: "1",
    eModeLtv: "0.9",
    eModeLiqThreshold: "0.93",
    debtCeiling: "0",
    borrowableInIsolation: true,
    // interest model config
    interestModel: "StablePrimaryInterestSecondModel",
  },
  iWBTC: {
    // iToken config
    iTokenUnderlyingAddress: "",
    iTokenName: "dForce WBTC",
    iTokenSymbol: "iWBTC",
    iTokenDecimals: 8,
    contractName: "iTokenV2",
    reserveRatio: "0.15",
    flashloanFeeRatio: "0.0004",
    protocolFeeRatio: "0.3",
    // oracle config
    price: "27000",
    // controller config
    collateralFactor: "0.8",
    liquidationThreshold: "0.83",
    borrowFactor: "1",
    supplyCapacity: "2500",
    borrowCapacity: "2500",
    distributionFactor: "1",
    eModeID: "3",
    eModeLtv: "0.9",
    eModeLiqThreshold: "0.93",
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
  iARB: {
    // Delay config
    minSingleLimit: "5000",
    midSingleLimit: "20000",
    minDailyLimit: "50000",
    midDailyLimit: "100000",
  },
  iDAI: {
    // Delay config
    minSingleLimit: "10000",
    midSingleLimit: "20000",
    minDailyLimit: "100000",
    midDailyLimit: "200000",
  },
  iDF: {
    // Delay config
    minSingleLimit: "50000",
    midSingleLimit: "80000",
    minDailyLimit: "300000",
    midDailyLimit: "600000",
  },
  iETH: {
    // Delay config
    minSingleLimit: "100",
    midSingleLimit: "200",
    minDailyLimit: "500",
    midDailyLimit: "1000",
  },
  iMEUX: {
    // Delay config
    minSingleLimit: "20000",
    midSingleLimit: "50000",
    minDailyLimit: "200000",
    midDailyLimit: "400000",
  },
  iMUSX: {
    // Delay config
    minSingleLimit: "20000",
    midSingleLimit: "50000",
    minDailyLimit: "200000",
    midDailyLimit: "400000",
  },
  iUNI: {
    // Delay config
    minSingleLimit: "5000",
    midSingleLimit: "10000",
    minDailyLimit: "30000",
    midDailyLimit: "50000",
  },
  iUSDC: {
    // Delay config
    minSingleLimit: "10000",
    midSingleLimit: "50000",
    minDailyLimit: "200000",
    midDailyLimit: "400000",
  },
  iUSDT: {
    // Delay config
    minSingleLimit: "10000",
    midSingleLimit: "50000",
    minDailyLimit: "200000",
    midDailyLimit: "400000",
  },
  iUSX: {
    // Delay config
    minSingleLimit: "10000",
    midSingleLimit: "50000",
    minDailyLimit: "200000",
    midDailyLimit: "400000",
  },
  iWBTC: {
    // Delay config
    minSingleLimit: "5",
    midSingleLimit: "20",
    minDailyLimit: "50",
    midDailyLimit: "100",
  },
};
