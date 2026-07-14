import http from "node:http";
import {mkdir, readFile, writeFile} from "node:fs/promises";
import {join} from "node:path";
import {fileURLToPath} from "node:url";
import {ethers} from "ethers";
import {marketsSnapshot} from "./markets.mjs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const INFURA_KEY = process.env.INFURA_KEY || "fc8ba3f3b8294917b0bfb6a37d711d4d";
const RPC_URL =
  process.env.ETH_RPC_URL || `https://mainnet.infura.io/v3/${INFURA_KEY}`;
const PORT = Number(process.env.PORT || 5177);
const START_BLOCK = Number(process.env.UNITUS_START_BLOCK || 11927175);
const BLOCK_CHUNK = Number(process.env.UNITUS_BLOCK_CHUNK || 20000);
const RPC_DELAY_MS = Number(process.env.UNITUS_RPC_DELAY_MS || 500);
const CONTROLLER = "0x8B53Ab2c0Df3230EA327017C91Eb909f815Ad113";
const USD_PRICE_TOKEN = "0x2f956b2f801c6dad74E87E7f45c94f6283BF0f45"; // iUSDC
const STATE_FILE = join(__dirname, "data", "positions-cache.json");
const STATE_VERSION = 3;

const provider = new ethers.JsonRpcProvider(RPC_URL, 1, {batchMaxCount: 1});

const controllerAbi = [
  "function getAlliTokens() view returns (address[])",
  "function getEnteredMarkets(address) view returns (address[])",
  "function getBorrowedAssets(address) view returns (address[])",
  "function calcAccountEquity(address) view returns (uint256,uint256,uint256,uint256)",
  "function markets(address) view returns (uint256,uint256,uint256,uint256,bool,bool,bool)",
  "function marketsV2(address) view returns (tuple(uint256 collateralFactorMantissa,uint256 borrowFactorMantissa,uint256 borrowCapacity,uint256 supplyCapacity,bool mintPaused,bool redeemPaused,bool borrowPaused,uint8 sModeID,bool borrowableInSegregation,uint256 debtCeiling,uint256 currentDebt))",
  "function accountsSMode(address) view returns (uint8)",
  "function getCollateralFactor(address,uint8,uint8,bool) view returns (uint256)",
  "function priceOracle() view returns (address)",
];

const iTokenAbi = [
  "event Borrow(address borrower,uint256 borrowAmount,uint256 accountBorrows,uint256 accountInterestIndex,uint256 totalBorrows)",
  "event RepayBorrow(address payer,address borrower,uint256 repayAmount,uint256 accountBorrows,uint256 accountInterestIndex,uint256 totalBorrows)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function underlying() view returns (address)",
  "function balanceOf(address) view returns (uint256)",
  "function borrowBalanceStored(address) view returns (uint256)",
  "function borrowBalanceCurrent(address) returns (uint256)",
  "function balanceOfUnderlying(address) returns (uint256)",
  "function exchangeRateStored() view returns (uint256)",
  "function exchangeRateCurrent() returns (uint256)",
];

const erc20Abi = [
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
];

const oracleAbi = [
  "function getUnderlyingPrice(address) view returns (uint256)",
  "function getAssetPrice(address) view returns (uint256)",
  "function getReaderPrice(address) view returns (uint256)",
];

const controller = new ethers.Contract(CONTROLLER, controllerAbi, provider);
const iTokenIface = new ethers.Interface(iTokenAbi);
const borrowTopic = ethers.id("Borrow(address,uint256,uint256,uint256,uint256)");

let persistentState = await loadPersistentState();
let cache = persistentState.snapshot
  ? {generatedAt: Date.now(), data: persistentState.snapshot}
  : {generatedAt: 0, data: null};
let snapshotJob = null;
let priceCache = {generatedAt: 0, data: null};
let priceJob = null;
let progress = {status: "idle"};
const liquidationThresholdCache = new Map();

async function loadPersistentState() {
  try {
    const raw = await readFile(STATE_FILE, "utf8");
    const parsed = JSON.parse(raw);
    const snapshot =
      parsed.version === STATE_VERSION && parsed.snapshot
        ? parsed.snapshot
        : null;
    return {
      startBlock: parsed.startBlock || START_BLOCK,
      scannedToBlock: parsed.scannedToBlock || START_BLOCK - 1,
      borrowers: Array.isArray(parsed.borrowers) ? parsed.borrowers : [],
      snapshot,
    };
  } catch {
    return {
      startBlock: START_BLOCK,
      scannedToBlock: START_BLOCK - 1,
      borrowers: [],
      snapshot: null,
    };
  }
}

async function savePersistentState(nextState = persistentState) {
  await mkdir(join(__dirname, "data"), {recursive: true});
  await writeFile(
    STATE_FILE,
    `${JSON.stringify(
      {
        version: STATE_VERSION,
        ...nextState,
        updatedAt: new Date().toISOString(),
      },
      null,
      2,
    )}\n`,
  );
}

function asNumber(value, decimals = 18) {
  return Number(ethers.formatUnits(value || 0n, decimals));
}

function unitUsdPrice(priceRaw, assetDecimals, usdcPriceRaw) {
  if (!priceRaw || !usdcPriceRaw) return 0;

  let assetUsdMantissa = (priceRaw * 10n ** 18n) / usdcPriceRaw;
  if (assetDecimals > 6) {
    assetUsdMantissa *= 10n ** BigInt(assetDecimals - 6);
  } else {
    assetUsdMantissa /= 10n ** BigInt(6 - assetDecimals);
  }

  return Number(ethers.formatUnits(assetUsdMantissa, 18));
}

function usdValue(amountRaw, decimals, priceRaw, usdcPriceRaw) {
  const amount = asNumber(amountRaw, decimals);
  return amount * unitUsdPrice(priceRaw || 0n, decimals, usdcPriceRaw || 0n);
}

function riskUsdValue(valueRaw, usdcPriceRaw) {
  const usdcPrice = Number(ethers.formatUnits(usdcPriceRaw || 0n, 18));
  return usdcPrice > 0
    ? Number(ethers.formatUnits(valueRaw || 0n, 24)) / usdcPrice
    : 0;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRateLimit(error) {
  const message = String(error?.shortMessage || error?.message || "");
  return message.includes("Too Many Requests") || message.includes("-32005");
}

async function rpcCall(label, fn, retries = 6) {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const result = await fn();
      await sleep(RPC_DELAY_MS);
      return result;
    } catch (error) {
      if (!isRateLimit(error) || attempt === retries) throw error;
      progress = {
        ...progress,
        status: "rate limited",
        message: `${label}: waiting before retry ${attempt + 1}/${retries}`,
      };
      await sleep(1500 * (attempt + 1));
    }
  }
}

async function safeCall(fn, fallback) {
  try {
    return await rpcCall("metadata", fn);
  } catch {
    return fallback;
  }
}

async function firstNonZeroPrice(oracle, candidates) {
  for (const candidate of candidates) {
    if (!candidate.address || candidate.address === ethers.ZeroAddress) continue;
    for (const method of candidate.methods) {
      const price = await safeCall(() => oracle[method](candidate.address), 0n);
      if (price > 0n) {
        return {
          price,
          source: `${method}(${candidate.label})`,
        };
      }
    }
  }

  return {price: 0n, source: "missing"};
}

async function priceForToken(oracle, meta) {
  return firstNonZeroPrice(oracle, [
    {
      address: meta.iToken,
      label: meta.iSymbol,
      methods: ["getUnderlyingPrice", "getAssetPrice", "getReaderPrice"],
    },
    {
      address: meta.underlying,
      label: meta.symbol,
      methods: ["getUnderlyingPrice", "getAssetPrice", "getReaderPrice"],
    },
  ]);
}

async function priceForTokenCached(oracle, meta, pricesByToken) {
  const key = meta.iToken.toLowerCase();
  if (pricesByToken.has(key)) return pricesByToken.get(key);
  const price = await priceForToken(oracle, meta);
  pricesByToken.set(key, price);
  return price;
}

async function loadTokenMeta(iTokenAddress) {
  const iToken = new ethers.Contract(iTokenAddress, iTokenAbi, provider);
  const iSymbol = await safeCall(() => iToken.symbol(), "iToken");
  const iDecimals = await safeCall(() => iToken.decimals(), 18);
  const underlying = await safeCall(() => iToken.underlying(), ethers.ZeroAddress);
  const marketV2 = await safeCall(() => controller.marketsV2(iTokenAddress), null);
  const market = marketV2 || (await safeCall(() => controller.markets(iTokenAddress), null));
  const marketInfo = market
    ? {
        collateralFactorRaw: market[0],
        collateralFactor: Number(ethers.formatUnits(market[0], 18)),
        borrowFactorRaw: market[1],
        borrowFactor: Number(ethers.formatUnits(market[1], 18)),
        sModeID: Number(market.sModeID ?? market[7] ?? 0),
      }
    : {collateralFactorRaw: 0n, collateralFactor: 0, borrowFactorRaw: 10n ** 18n, borrowFactor: 1, sModeID: 0};

  if (underlying === ethers.ZeroAddress) {
    return {
      iToken: iTokenAddress,
      symbol: iSymbol === "iETH" ? "ETH" : iSymbol.replace(/^i/, ""),
      iSymbol,
      decimals: Number(iDecimals),
      ...marketInfo,
      contract: iToken,
    };
  }

  const asset = new ethers.Contract(underlying, erc20Abi, provider);
  const symbol = await safeCall(() => asset.symbol(), iSymbol.replace(/^i/, ""));
  const decimals = await safeCall(() => asset.decimals(), iDecimals);

  return {
    iToken: iTokenAddress,
    underlying,
    symbol,
    iSymbol,
    decimals: Number(decimals),
    ...marketInfo,
    contract: iToken,
  };
}

async function liquidationThresholdFor(meta, accountSMode) {
  const iTokenSMode = Number(meta.sModeID || 0);
  const key = `${meta.iToken.toLowerCase()}:${accountSMode}:${iTokenSMode}`;
  if (liquidationThresholdCache.has(key)) return liquidationThresholdCache.get(key);

  const raw = await safeCall(
    () => controller.getCollateralFactor(meta.iToken, accountSMode, iTokenSMode, true),
    meta.collateralFactorRaw || 0n,
  );
  const threshold = Number(ethers.formatUnits(raw || 0n, 18));
  liquidationThresholdCache.set(key, threshold);
  return threshold;
}

async function discoverBorrowers(iTokens, fromBlock, toBlock, knownBorrowers) {
  const borrowers = new Set(knownBorrowers);
  if (fromBlock > toBlock) return [...borrowers];

  const totalChunks = Math.max(1, Math.ceil((toBlock - fromBlock + 1) / BLOCK_CHUNK));
  let completedChunks = 0;

  for (let start = fromBlock; start <= toBlock; start += BLOCK_CHUNK) {
    const end = Math.min(start + BLOCK_CHUNK - 1, toBlock);
    progress = {
      status: "scanning borrow logs",
      fromBlock,
      toBlock,
      currentBlock: start,
      completedChunks,
      totalChunks,
      borrowers: borrowers.size,
    };
    const logs = await rpcCall("Borrow logs", () =>
      provider.getLogs({
        address: iTokens,
        fromBlock: start,
        toBlock: end,
        topics: [borrowTopic],
      }),
    );
    completedChunks += 1;

    for (const log of logs) {
      const parsed = iTokenIface.parseLog(log);
      borrowers.add(ethers.getAddress(parsed.args.borrower));
    }

    persistentState = {
      ...persistentState,
      startBlock: START_BLOCK,
      scannedToBlock: end,
      borrowers: [...borrowers],
    };
    await savePersistentState();
  }

  return [...borrowers];
}

async function accountPosition(account, metas, oracle, usdcPrice, pricesByToken) {
  const [equity, shortfall, collateralValue, borrowedRiskValue] =
    await rpcCall("account equity", () => controller.calcAccountEquity(account));
  const entered = await rpcCall("entered markets", () =>
    controller.getEnteredMarkets(account),
  );
  const borrowedAssets = await rpcCall("borrowed assets", () =>
    controller.getBorrowedAssets(account),
  );
  const accountSMode = Number(
    await safeCall(() => controller.accountsSMode(account), 0),
  );
  const enteredSet = new Set(entered.map((address) => address.toLowerCase()));
  const borrowedSet = new Set(
    borrowedAssets.map((address) => address.toLowerCase()),
  );

  const deposits = [];
  const borrows = [];
  let depositedUsd = 0;
  let borrowedUsd = 0;
  let simulatedCollateralUsd = 0;
  let simulatedBorrowedRiskUsd = 0;

  for (const meta of metas) {
    const lower = meta.iToken.toLowerCase();
    if (!enteredSet.has(lower) && !borrowedSet.has(lower)) continue;

    const {price, source: priceSource} = await priceForTokenCached(
      oracle,
      meta,
      pricesByToken,
    );
    let underlyingBalance = await safeCall(
      () => meta.contract.balanceOfUnderlying.staticCall(account),
      null,
    );
    let borrowBalance = await safeCall(
      () => meta.contract.borrowBalanceCurrent.staticCall(account),
      null,
    );
    if (underlyingBalance === null) {
      const exchangeRate = await safeCall(
        () => meta.contract.exchangeRateCurrent.staticCall(),
        await safeCall(() => meta.contract.exchangeRateStored(), 0n),
      );
      const iBalance = await safeCall(() => meta.contract.balanceOf(account), 0n);
      underlyingBalance = (iBalance * exchangeRate) / 10n ** 18n;
    }
    if (borrowBalance === null) {
      borrowBalance = await safeCall(
        () => meta.contract.borrowBalanceStored(account),
        0n,
      );
    }

    if (enteredSet.has(lower) && underlyingBalance > 0n) {
      const amount = underlyingBalance;
      const usd = usdValue(amount, meta.decimals, price, usdcPrice);
      const liquidationThreshold = await liquidationThresholdFor(meta, accountSMode);
      depositedUsd += usd;
      simulatedCollateralUsd += usd * liquidationThreshold;
      deposits.push({
        asset: meta.symbol,
        iToken: meta.iToken,
        amount: asNumber(amount, meta.decimals),
        usd,
        liquidationThreshold,
        accountSMode,
        assetSMode: meta.sModeID,
        priceSource,
      });
    }

    if (borrowedSet.has(lower) && borrowBalance > 0n) {
      const usd = usdValue(borrowBalance, meta.decimals, price, usdcPrice);
      borrowedUsd += usd;
      simulatedBorrowedRiskUsd +=
        meta.borrowFactor > 0 ? usd / meta.borrowFactor : usd;
      borrows.push({
        asset: meta.symbol,
        iToken: meta.iToken,
        amount: asNumber(borrowBalance, meta.decimals),
        usd,
        borrowFactor: meta.borrowFactor,
        priceSource,
      });
    }
  }
  const simulatedEquityUsd = Math.max(
    simulatedCollateralUsd - simulatedBorrowedRiskUsd,
    0,
  );
  const simulatedShortfallUsd = Math.max(
    simulatedBorrowedRiskUsd - simulatedCollateralUsd,
    0,
  );

  return {
    account,
    accountSMode,
    status: simulatedShortfallUsd > 0 ? "liquidatable" : "healthy",
    protocolStatus: shortfall > 0n ? "liquidatable" : "healthy",
    equityUsd: simulatedEquityUsd,
    shortfallUsd: simulatedShortfallUsd,
    protocolEquityUsd: riskUsdValue(equity, usdcPrice),
    protocolShortfallUsd: riskUsdValue(shortfall, usdcPrice),
    collateralRiskUsd: riskUsdValue(collateralValue, usdcPrice),
    borrowedRiskUsd: riskUsdValue(borrowedRiskValue, usdcPrice),
    simulatedCollateralUsd,
    simulatedBorrowedRiskUsd,
    depositedUsd,
    borrowedUsd,
    deposits: deposits.sort((a, b) => b.usd - a.usd),
    borrows: borrows.sort((a, b) => b.usd - a.usd),
  };
}

async function marketContext() {
  const latestBlock = await rpcCall("latest block", () => provider.getBlockNumber());
  const iTokens = await rpcCall("market list", () => controller.getAlliTokens());
  const oracleAddress = await rpcCall("oracle", () => controller.priceOracle());
  const oracle = new ethers.Contract(oracleAddress, oracleAbi, provider);
  const metas = [];
  for (const [index, iToken] of iTokens.entries()) {
    progress = {
      status: "loading market metadata",
      currentMarket: index,
      totalMarkets: iTokens.length,
    };
    metas.push(await loadTokenMeta(iToken));
  }
  const {price: usdcPrice} = await firstNonZeroPrice(oracle, [
    {
      address: USD_PRICE_TOKEN,
      label: "iUSDC",
      methods: ["getUnderlyingPrice", "getAssetPrice", "getReaderPrice"],
    },
  ]);
  return {latestBlock, iTokens, oracleAddress, oracle, metas, usdcPrice};
}

async function scanBorrowersToLatest(iTokens, latestBlock, fromBlock = START_BLOCK) {
  const effectiveStartBlock =
    persistentState.startBlock === START_BLOCK
      ? Math.max(fromBlock, persistentState.scannedToBlock + 1)
      : fromBlock;
  const knownBorrowers =
    persistentState.startBlock === START_BLOCK ? persistentState.borrowers : [];
  const borrowers = await discoverBorrowers(
    iTokens,
    effectiveStartBlock,
    latestBlock,
    knownBorrowers,
  );
  persistentState = {
    ...persistentState,
    startBlock: START_BLOCK,
    scannedToBlock: latestBlock,
    borrowers,
  };
  await savePersistentState();
  return {borrowers, effectiveStartBlock};
}

async function buildSnapshot({scanLogs = false, fromBlock = START_BLOCK} = {}) {
  const {latestBlock, iTokens, oracleAddress, oracle, metas, usdcPrice} =
    await marketContext();
  let borrowers = persistentState.borrowers;
  let effectiveStartBlock = persistentState.scannedToBlock + 1;
  let didScan = false;

  if (scanLogs || borrowers.length === 0) {
    didScan = true;
    ({borrowers, effectiveStartBlock} = await scanBorrowersToLatest(
      iTokens,
      latestBlock,
      fromBlock,
    ));
  }

  const positions = [];
  const pricesByToken = new Map();
  for (const [index, account] of borrowers.entries()) {
    progress = {
      status: "checking positions",
      fromBlock,
      toBlock: latestBlock,
      checkedAccounts: index,
      totalAccounts: borrowers.length,
    };
    const position = await accountPosition(
      account,
      metas,
      oracle,
      usdcPrice,
      pricesByToken,
    );
    if (position.borrowedUsd > 0) positions.push(position);
  }

  positions.sort(
    (a, b) => b.shortfallUsd - a.shortfallUsd || b.borrowedUsd - a.borrowedUsd,
  );

  const snapshot = {
    generatedAt: new Date().toISOString(),
    latestBlock,
    startBlock: START_BLOCK,
    incrementalStartBlock: effectiveStartBlock,
    scannedToBlock: persistentState.scannedToBlock,
    scannedThisRefresh: didScan,
    simulatedToBlock: latestBlock,
    controller: CONTROLLER,
    oracle: oracleAddress,
    positionCount: positions.length,
    totals: {
      depositedUsd: positions.reduce((sum, row) => sum + row.depositedUsd, 0),
      borrowedUsd: positions.reduce((sum, row) => sum + row.borrowedUsd, 0),
      shortfallUsd: positions.reduce((sum, row) => sum + row.shortfallUsd, 0),
      liquidatable: positions.filter((row) => row.status === "liquidatable")
        .length,
      staleLocal: positions.filter((row) => row.status !== row.protocolStatus)
        .length,
    },
    positions,
  };

  persistentState = {
    startBlock: START_BLOCK,
    scannedToBlock: didScan ? latestBlock : persistentState.scannedToBlock,
    borrowers,
    snapshot,
  };
  await savePersistentState();

  return snapshot;
}

async function priceSnapshot() {
  const {iTokens, oracleAddress, oracle, usdcPrice} = await marketContext();
  const assets = [];

  for (const [index, iToken] of iTokens.entries()) {
    progress = {
      status: "checking prices",
      currentMarket: index,
      totalMarkets: iTokens.length,
    };
    const meta = await loadTokenMeta(iToken);
    const {price, source} = await priceForToken(oracle, meta);
    assets.push({
      asset: meta.symbol,
      iToken: meta.iToken,
      iSymbol: meta.iSymbol,
      underlying: meta.underlying || ethers.ZeroAddress,
      decimals: meta.decimals,
      priceRaw: price.toString(),
      priceUsd: unitUsdPrice(price || 0n, meta.decimals, usdcPrice || 0n),
      priceSource: source,
      ok: price > 0n,
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    oracle: oracleAddress,
    usdcPriceRaw: usdcPrice.toString(),
    missing: assets.filter((asset) => !asset.ok).map((asset) => asset.asset),
    assets,
  };
}

async function prices(force = false) {
  if (!force && priceCache.data && Date.now() - priceCache.generatedAt < 300000) {
    return priceCache.data;
  }
  if (!priceJob) {
    progress = {status: "checking prices"};
    priceJob = priceSnapshot()
      .then((data) => {
        priceCache = {generatedAt: Date.now(), data};
        progress = {status: "prices complete"};
        return data;
      })
      .catch((error) => {
        progress = {status: "error", error: error.message};
        return null;
      })
      .finally(() => {
        priceJob = null;
      });
  }
  return priceCache.data || {loading: true, progress};
}

async function snapshot({force = false, scanLogs = false} = {}) {
  if (snapshotJob) {
    return {
      loading: true,
      progress,
      staleSnapshot: cache.data
        ? {
            generatedAt: cache.data.generatedAt,
            latestBlock: cache.data.latestBlock,
            positionCount: cache.data.positionCount,
          }
        : null,
    };
  }
  if (!force && cache.data && Date.now() - cache.generatedAt < 60000) {
    return cache.data;
  }
  if (progress.status === "error" && !force) {
    return {error: progress.error};
  }
  if (!snapshotJob) {
    progress = {status: scanLogs ? "starting scan and simulation" : "starting simulation"};
    snapshotJob = buildSnapshot({scanLogs})
      .then((data) => {
        cache = {generatedAt: Date.now(), data};
        progress = {status: "complete"};
        return data;
      })
      .catch((error) => {
        progress = {status: "error", error: error.message};
        return null;
      })
      .finally(() => {
        snapshotJob = null;
      });
  }
  return cache.data || {loading: true, progress};
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host}`);
    if (url.pathname === "/api/positions") {
      const fromBlock = url.searchParams.get("fromBlock");
      const data =
        fromBlock === null
          ? await snapshot({
              force: url.searchParams.get("refresh") === "1",
              scanLogs: url.searchParams.get("scan") === "1",
            })
          : await buildSnapshot({
              fromBlock: Number(fromBlock),
              scanLogs: true,
            });
      res.writeHead(200, {"content-type": "application/json"});
      res.end(JSON.stringify(data));
      return;
    }

    if (url.pathname === "/api/prices") {
      const data = await prices(url.searchParams.get("refresh") === "1");
      res.writeHead(200, {"content-type": "application/json"});
      res.end(JSON.stringify(data));
      return;
    }

    if (url.pathname === "/api/markets") {
      const data = await marketsSnapshot(url.searchParams.get("refresh") === "1");
      res.writeHead(200, {"content-type": "application/json"});
      res.end(JSON.stringify(data));
      return;
    }

    const file = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
    const content = await readFile(join(__dirname, "public", file));
    const type = file.endsWith(".css")
      ? "text/css"
      : file.endsWith(".js")
        ? "text/javascript"
        : "text/html";
    res.writeHead(200, {"content-type": type});
    res.end(content);
  } catch (error) {
    res.writeHead(500, {"content-type": "application/json"});
    res.end(JSON.stringify({error: error.message}));
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Unitus monitor: http://127.0.0.1:${PORT}`);
});
