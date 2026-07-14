import {ethers} from "ethers";

const INFURA_KEY =
  process.env.INFURA_KEY || "fc8ba3f3b8294917b0bfb6a37d711d4d";

const CHAINS = [
  {
    id: 1,
    key: "ethereum",
    name: "Ethereum",
    rpc: process.env.ETH_RPC_URL || `https://mainnet.infura.io/v3/${INFURA_KEY}`,
    fallbackRpc: "https://eth.drpc.org",
    rpcSource: "Infura",
    controller: "0x8B53Ab2c0Df3230EA327017C91Eb909f815Ad113",
    explorer: "https://etherscan.io",
  },
  {
    id: 42161,
    key: "arbitrum",
    name: "Arbitrum",
    rpc:
      process.env.ARBITRUM_RPC_URL ||
      `https://arbitrum-mainnet.infura.io/v3/${INFURA_KEY}`,
    fallbackRpc: "https://arbitrum-one-rpc.publicnode.com",
    controller: "0x8E7e9eA9023B81457Ae7E6D2a51b003D421E5408",
    rpcSource: "Infura",
    explorer: "https://arbiscan.io",
  },
  {
    id: 10,
    key: "optimism",
    name: "Optimism",
    rpc:
      process.env.OPTIMISM_RPC_URL ||
      `https://optimism-mainnet.infura.io/v3/${INFURA_KEY}`,
    fallbackRpc: "https://optimism-rpc.publicnode.com",
    controller: "0xA300A84D8970718Dac32f54F61Bd568142d8BCF4",
    rpcSource: "Infura",
    explorer: "https://optimistic.etherscan.io",
  },
  {
    id: 137,
    key: "polygon",
    name: "Polygon",
    rpc:
      process.env.POLYGON_RPC_URL ||
      `https://polygon-mainnet.infura.io/v3/${INFURA_KEY}`,
    fallbackRpc: "https://polygon-bor-rpc.publicnode.com",
    controller: "0x52eaCd19E38D501D006D2023C813d7E37F025f37",
    rpcSource: "Infura",
    explorer: "https://polygonscan.com",
  },
  {
    id: 56,
    key: "bsc",
    name: "BSC",
    rpc:
      process.env.BSC_RPC_URL ||
      `https://bsc-mainnet.infura.io/v3/${INFURA_KEY}`,
    fallbackRpc: "https://bsc-rpc.publicnode.com",
    controller: "0x0b53E608bD058Bb54748C35148484fD627E6dc0A",
    rpcSource: "Infura",
    explorer: "https://bscscan.com",
  },
  {
    id: 1030,
    key: "conflux",
    name: "Conflux eSpace",
    rpc: process.env.CONFLUX_RPC_URL || "https://evm.confluxrpc.com",
    controller: "0xA377eCF53253275125D0a150aF195186271f6a56",
    rpcSource: "public RPC",
    explorer: "https://evm.confluxscan.net",
  },
  {
    id: 8453,
    key: "base",
    name: "Base",
    rpc:
      process.env.BASE_RPC_URL ||
      `https://base-mainnet.infura.io/v3/${INFURA_KEY}`,
    fallbackRpc: "https://base-rpc.publicnode.com",
    rpcSource: "Infura",
    controller: "0xBae8d153331129EB40E390A7Dd485363135fcE22",
    explorer: "https://basescan.org",
  },
];

const controllerAbi = [
  "function getAlliTokens() view returns (address[])",
  "function priceOracle() view returns (address)",
  "function markets(address) view returns (uint256,uint256,uint256,uint256,bool,bool,bool)",
  "function marketsV2(address) view returns (tuple(uint256 collateralFactorMantissa,uint256 borrowFactorMantissa,uint256 borrowCapacity,uint256 supplyCapacity,bool mintPaused,bool redeemPaused,bool borrowPaused,uint8 sModeID,bool borrowableInSegregation,uint256 debtCeiling,uint256 currentDebt))",
  "function getLTV(address) view returns (uint256)",
  "function getLiquidationThreshold(address) view returns (uint256)",
  "function getSModeLTV(address) view returns (uint256)",
  "function getSModeLiquidationThreshold(address) view returns (uint256)",
  "function getSModeLength() view returns (uint256)",
  "function sModes(uint256) view returns (uint256 liquidationIncentive,uint256 closeFactor,string label)",
];

const iTokenAbi = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function underlying() view returns (address)",
  "function reserveRatio() view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function totalBorrows() view returns (uint256)",
  "function totalReserves() view returns (uint256)",
  "function getCash() view returns (uint256)",
  "function exchangeRateStored() view returns (uint256)",
  "function interestRateModel() view returns (address)",
];

const erc20Abi = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
];

const oracleAbi = [
  "function getUnderlyingPriceAndStatus(address) view returns (uint256,bool)",
  "function getUnderlyingPrice(address) view returns (uint256)",
];

const MULTICALL3 = "0xcA11bde05977b3631167028862bE2a173976CA11";
const multicallAbi = [
  "function aggregate3(tuple(address target,bool allowFailure,bytes callData)[] calls) view returns (tuple(bool success,bytes returnData)[])",
];
const controllerInterface = new ethers.Interface(controllerAbi);
const iTokenInterface = new ethers.Interface(iTokenAbi);
const erc20Interface = new ethers.Interface(erc20Abi);
const oracleInterface = new ethers.Interface(oracleAbi);

let cache = {at: 0, data: null};
let job = null;

async function safe(call, fallback = null) {
  try {
    return await call();
  } catch {
    return fallback;
  }
}

function decimal(raw, decimals = 18) {
  return raw === null ? null : ethers.formatUnits(raw, decimals);
}

function ratio(raw) {
  return raw === null ? null : Number(ethers.formatUnits(raw, 18));
}

function capacity(raw, decimals) {
  if (raw === null) return null;
  if (raw === ethers.MaxUint256) return "unlimited";
  return decimal(raw, decimals);
}

function usdPrice(raw, decimals) {
  if (raw === null || raw === 0n || decimals > 36) return null;
  return Number(ethers.formatUnits(raw, 36 - decimals));
}

function callKey(address, field) {
  return `${address.toLowerCase()}:${field}`;
}

async function multiRead(provider, descriptors) {
  const multicall = new ethers.Contract(MULTICALL3, multicallAbi, provider);
  const values = new Map();
  for (let start = 0; start < descriptors.length; start += 40) {
    const chunk = descriptors.slice(start, start + 40);
    const results = await multicall.aggregate3(
      chunk.map(({target, iface, method, args = []}) => [
        target,
        true,
        iface.encodeFunctionData(method, args),
      ]),
    );
    results.forEach((result, index) => {
      const descriptor = chunk[index];
      if (!result.success) return;
      try {
        const decoded = descriptor.iface.decodeFunctionResult(
          descriptor.method,
          result.returnData,
        );
        values.set(descriptor.key, decoded.length === 1 ? decoded[0] : decoded);
      } catch {
        // Some legacy underlying tokens return non-standard metadata encodings.
      }
    });
  }
  return values;
}

function tokenCall(address, method) {
  return {
    key: callKey(address, method),
    target: address,
    iface: iTokenInterface,
    method,
  };
}

function controllerCall(controller, address, method) {
  return {
    key: callKey(address, method),
    target: controller,
    iface: controllerInterface,
    method,
    args: [address],
  };
}

function oracleCall(oracle, address, method) {
  return {
    key: callKey(address, method),
    target: oracle,
    iface: oracleInterface,
    method,
    args: [address],
  };
}

function assetFromValues({address, values, underlyingValues, chain, sModes}) {
  const value = (field) => values.get(callKey(address, field)) ?? null;
  const v2 = value("marketsV2");
  const rawMarket = v2 || value("markets");
  const market = {
    collateralFactor: rawMarket?.[0] ?? null,
    borrowFactor: rawMarket?.[1] ?? null,
    borrowCapacity: rawMarket?.[2] ?? null,
    supplyCapacity: rawMarket?.[3] ?? null,
    mintPaused: Boolean(rawMarket?.[4]),
    redeemPaused: Boolean(rawMarket?.[5]),
    borrowPaused: Boolean(rawMarket?.[6]),
    sModeID: Number(v2?.sModeID ?? v2?.[7] ?? 0),
    borrowableInSegregation:
      v2 === null ? null : Boolean(v2.borrowableInSegregation ?? v2[8]),
    debtCeiling: v2?.debtCeiling ?? v2?.[9] ?? null,
    currentDebt: v2?.currentDebt ?? v2?.[10] ?? null,
  };
  const iName = value("name") || "Unknown market";
  const iSymbol = value("symbol") || "?";
  const iDecimals = Number(value("decimals") ?? 18);
  const underlying = value("underlying");
  const isNative = !underlying || underlying === ethers.ZeroAddress;
  const underlyingValue = (field) =>
    isNative ? null : underlyingValues.get(callKey(underlying, field)) ?? null;
  const assetDecimals = Number(underlyingValue("decimals") ?? iDecimals);
  const totalSupply = value("totalSupply");
  const totalBorrows = value("totalBorrows");
  const totalReserves = value("totalReserves");
  const cash = value("getCash");
  const exchangeRate = value("exchangeRateStored");
  const suppliedUnderlying =
    totalSupply === null || exchangeRate === null
      ? null
      : (totalSupply * exchangeRate) / 10n ** 18n;
  const availableLiquidity =
    cash === null || totalBorrows === null || totalReserves === null
      ? null
      : cash + totalBorrows - totalReserves;
  const utilization =
    availableLiquidity === null || availableLiquidity === 0n || totalBorrows === null
      ? null
      : Number(totalBorrows) / Number(availableLiquidity);
  const priceAndStatus = value("getUnderlyingPriceAndStatus");
  const priceRaw = priceAndStatus?.[0] ?? value("getUnderlyingPrice");
  const ltv = value("getLTV") ?? market.collateralFactor;
  const liquidationThreshold =
    value("getLiquidationThreshold") ?? market.collateralFactor;
  const sMode = sModes.find((row) => row.id === market.sModeID) || null;

  return {
    chain: chain.key,
    chainName: chain.name,
    explorer: chain.explorer,
    rpcSource: chain.rpcSource,
    address,
    iName,
    iSymbol,
    iDecimals,
    underlying: isNative ? null : underlying,
    name: underlyingValue("name") || iName,
    symbol: underlyingValue("symbol") || iSymbol.replace(/^i/, ""),
    decimals: assetDecimals,
    priceUsd: usdPrice(priceRaw, assetDecimals),
    priceStatus: priceAndStatus ? Boolean(priceAndStatus[1]) : priceRaw > 0n,
    reserveRatio: ratio(value("reserveRatio")),
    totalSupply: decimal(totalSupply, iDecimals),
    suppliedUnderlying: decimal(suppliedUnderlying, assetDecimals),
    totalBorrows: decimal(totalBorrows, assetDecimals),
    totalReserves: decimal(totalReserves, assetDecimals),
    cash: decimal(cash, assetDecimals),
    utilization,
    exchangeRate: decimal(exchangeRate, 18),
    interestRateModel: value("interestRateModel"),
    ltv: ratio(ltv),
    liquidationThreshold: ratio(liquidationThreshold),
    borrowFactor: ratio(market.borrowFactor),
    supplyCapacity: capacity(market.supplyCapacity, assetDecimals),
    borrowCapacity: capacity(market.borrowCapacity, assetDecimals),
    mintPaused: market.mintPaused,
    redeemPaused: market.redeemPaused,
    borrowPaused: market.borrowPaused,
    sModeID: market.sModeID,
    sModeLabel: sMode?.label || null,
    sModeLTV: ratio(value("getSModeLTV")),
    sModeLiquidationThreshold: ratio(value("getSModeLiquidationThreshold")),
    sModeCloseFactor: sMode?.closeFactor ?? null,
    sModeLiquidationIncentive: sMode?.liquidationIncentive ?? null,
    borrowableInSegregation: market.borrowableInSegregation,
    debtCeiling: decimal(market.debtCeiling, 2),
    currentDebt: decimal(market.currentDebt, 2),
  };
}

async function readChain(chain, provider) {
  const controller = new ethers.Contract(
    chain.controller,
    controllerAbi,
    provider,
  );
  const [blockNumber, addresses, oracleAddress, sModeLength] = await Promise.all([
    provider.getBlockNumber(),
    controller.getAlliTokens(),
    controller.priceOracle(),
    safe(() => controller.getSModeLength(), 0n),
  ]);
  const tokenMethods = [
    "name",
    "symbol",
    "decimals",
    "underlying",
    "reserveRatio",
    "totalSupply",
    "totalBorrows",
    "totalReserves",
    "getCash",
    "exchangeRateStored",
    "interestRateModel",
  ];
  const controllerMethods = [
    "marketsV2",
    "markets",
    "getLTV",
    "getLiquidationThreshold",
    "getSModeLTV",
    "getSModeLiquidationThreshold",
  ];
  const descriptors = addresses.flatMap((address) => [
    ...tokenMethods.map((method) => tokenCall(address, method)),
    ...controllerMethods.map((method) =>
      controllerCall(chain.controller, address, method),
    ),
    oracleCall(oracleAddress, address, "getUnderlyingPriceAndStatus"),
    oracleCall(oracleAddress, address, "getUnderlyingPrice"),
  ]);
  for (let id = 0; id < Number(sModeLength); id += 1) {
    descriptors.push({
      key: `smode:${id}`,
      target: chain.controller,
      iface: controllerInterface,
      method: "sModes",
      args: [id],
    });
  }
  const values = await multiRead(provider, descriptors);
  const sModes = Array.from({length: Number(sModeLength)}, (_, id) => {
    const config = values.get(`smode:${id}`);
    return config
      ? {
          id,
          label: config.label ?? config[2],
          liquidationIncentive: ratio(config.liquidationIncentive ?? config[0]),
          closeFactor: ratio(config.closeFactor ?? config[1]),
        }
      : null;
  }).filter(Boolean);
  const underlyingDescriptors = addresses.flatMap((address) => {
    const underlying = values.get(callKey(address, "underlying"));
    if (!underlying || underlying === ethers.ZeroAddress) return [];
    return ["name", "symbol", "decimals"].map((method) => ({
      key: callKey(underlying, method),
      target: underlying,
      iface: erc20Interface,
      method,
    }));
  });
  const underlyingValues = await multiRead(provider, underlyingDescriptors);
  const assets = addresses.map((address) =>
    assetFromValues({address, values, underlyingValues, chain, sModes}),
  );
  return {
    key: chain.key,
    name: chain.name,
    chainId: chain.id,
    controller: chain.controller,
    explorer: chain.explorer,
    rpcSource: chain.rpcSource,
    blockNumber,
    status: "ok",
    marketCount: assets.length,
    sModes,
    assets,
  };
}

function withTimeout(promise, milliseconds) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error(`RPC timed out after ${milliseconds / 1000} seconds`)),
        milliseconds,
      ),
    ),
  ]);
}

async function readChainWithTimeout(chain) {
  try {
    return await readChainAttempt(chain, chain.fallbackRpc ? 12000 : 25000);
  } catch (primaryError) {
    if (!chain.fallbackRpc) throw primaryError;
    return readChainAttempt(
      {...chain, rpc: chain.fallbackRpc, rpcSource: "public fallback"},
      12000,
    );
  }
}

async function readChainAttempt(chain, timeout) {
  const provider = new ethers.JsonRpcProvider(chain.rpc, chain.id, {
    batchMaxCount: 1,
    staticNetwork: true,
  });
  try {
    return await withTimeout(readChain(chain, provider), timeout);
  } finally {
    provider.destroy();
  }
}

async function buildSnapshot() {
  const settled = await Promise.allSettled(CHAINS.map(readChainWithTimeout));
  const chains = settled.map((result, index) =>
    result.status === "fulfilled"
      ? result.value
      : {
          key: CHAINS[index].key,
          name: CHAINS[index].name,
          chainId: CHAINS[index].id,
          controller: CHAINS[index].controller,
          explorer: CHAINS[index].explorer,
          status: "error",
          error: result.reason?.shortMessage || result.reason?.message || "RPC error",
          marketCount: 0,
          sModes: [],
          assets: [],
        },
  );
  const assets = chains.flatMap((chain) => chain.assets);
  return {
    generatedAt: new Date().toISOString(),
    refreshIntervalMs: 1800000,
    chainCount: chains.length,
    healthyChainCount: chains.filter((chain) => chain.status === "ok").length,
    marketCount: assets.length,
    chains,
    assets,
  };
}

export async function marketsSnapshot(force = false) {
  if (!force && cache.data && Date.now() - cache.at < 1800000) return cache.data;
  if (!job) {
    job = buildSnapshot()
      .then((data) => {
        cache = {at: Date.now(), data};
        return data;
      })
      .finally(() => {
        job = null;
      });
  }
  return job;
}
