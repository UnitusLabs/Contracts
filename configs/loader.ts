export type Config = {
  eModeConfigs: {
    liquidationIncentive: string;
    closeFactor: string;
    label: string;
  }[];
  msdTokenConfigs: {
    [name: string]: {name: string; symbl: string; decimalas: number};
  };
  controllerConfigs: {
    closeFactor: string;
    liquidationIncentive: string;
    pauseGuardian: string;
  };
  iTokenConfigs: {
    [name: string]: {
      iTokenUnderlyingAddress: string;
      iTokenName: string;
      iTokenSymbol: string;
      iTokenDecimals: number;
      contractName: string;
      reserveRatio: string;
      flashloanFeeRatio: string;
      protocolFeeRatio: string;
      price: string;
      collateralFactor: string;
      liquidationThreshold: string;
      borrowFactor: string;
      supplyCapacity: string;
      borrowCapacity: string;
      distributionFactor: string;
      eModeID: string;
      eModeLtv: string;
      eModeLiqThreshold: string;
      debtCeiling: string;
      borrowableInIsolation: boolean;
      interestModel: string;
    };
  };
  timeLockStrategyConfigs: {
    minSingleWaitSeconds: number;
    midSingleWaitSeconds: number;
    maxSingleWaitSeconds: number;
    minDailyWaitSeconds: number;
    midDailyWaitSeconds: number;
    maxDailyWaitSeconds: number;
    [name: string]:
      | number
      | {
          minSingleLimit: string;
          midSingleLimit: string;
          minDailyLimit: string;
          midDailyLimit: string;
        };
  };
};

export async function loadConfig(network: string): Promise<Config> {
  const configModule = await import(`./config.${network}`);
  return configModule;
}
