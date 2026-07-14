const state = {snapshot: null, timer: null, selectedChains: null};

const apiBase = window.location.protocol === "file:" ? "http://127.0.0.1:5177" : "";
const compactFormat = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 2,
});
const usdFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});
const percentFormat = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 2,
});

const els = {
  meta: document.querySelector("#marketMeta"),
  refresh: document.querySelector("#marketRefresh"),
  chainCount: document.querySelector("#chainCount"),
  marketCount: document.querySelector("#marketCount"),
  suppliedValue: document.querySelector("#suppliedValue"),
  borrowedValue: document.querySelector("#borrowedValue"),
  chainBreakdown: document.querySelector("#chainBreakdown"),
  chainErrors: document.querySelector("#chainErrors"),
  chainToggles: document.querySelector("#chainToggles"),
  selectAllChains: document.querySelector("#selectAllChains"),
  selectNoChains: document.querySelector("#selectNoChains"),
  statusFilter: document.querySelector("#marketStatusFilter"),
  search: document.querySelector("#marketSearch"),
  rows: document.querySelector("#marketRows"),
};

function escapeHtml(value) {
  return String(value ?? "-").replace(
    /[&<>'"]/g,
    (character) =>
      ({"&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"})[
        character
      ],
  );
}

function amount(value, compact = false) {
  if (value === null || value === undefined) return "-";
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return escapeHtml(value);
  if (numeric === 0) return "0";
  if (compact && Math.abs(numeric) >= 1000) return compactFormat.format(numeric);
  const magnitude = Math.floor(Math.log10(Math.abs(numeric)));
  const maximumFractionDigits = Math.min(18, Math.max(4, 3 - magnitude));
  return new Intl.NumberFormat("en-US", {maximumFractionDigits}).format(numeric);
}

function percent(value) {
  return value === null || value === undefined ? "-" : percentFormat.format(value);
}

function usd(value) {
  if (!Number.isFinite(value)) return "-";
  if (value === 0 || Math.abs(value) >= 0.01) return usdFormat.format(value);
  const magnitude = Math.floor(Math.log10(Math.abs(value)));
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: Math.min(18, Math.max(2, 3 - magnitude)),
  }).format(value);
}

function shortAddress(address) {
  return address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "Native asset";
}

function status(asset) {
  if (asset.mintPaused || asset.redeemPaused || asset.borrowPaused) return "paused";
  if (!asset.priceStatus) return "priceIssue";
  return "active";
}

function isZero(value) {
  return value !== null && value !== undefined && Number(value) === 0;
}

function isCapZero(value) {
  return isZero(value) && value !== "unlimited";
}

function matchesZeroFilter(asset, selectedStatus) {
  switch (selectedStatus) {
    case "supplyZero":
      return isZero(asset.suppliedUnderlying);
    case "borrowZero":
      return isZero(asset.totalBorrows);
    case "supplyBorrowZero":
      return isZero(asset.suppliedUnderlying) && isZero(asset.totalBorrows);
    case "supplyCapZero":
      return isCapZero(asset.supplyCapacity);
    case "borrowCapZero":
      return isCapZero(asset.borrowCapacity);
    case "supplyBorrowCapsZero":
      return isCapZero(asset.supplyCapacity) && isCapZero(asset.borrowCapacity);
    default:
      return null;
  }
}

function cap(value) {
  return value === "unlimited" ? "Unlimited" : amount(value, true);
}

function statusFlags(asset) {
  return [
    ["Mint", asset.mintPaused],
    ["Redeem", asset.redeemPaused],
    ["Borrow", asset.borrowPaused],
  ]
    .map(
      ([label, paused]) =>
        `<span class="flag ${paused ? "flagPaused" : "flagActive"}" title="${label} ${paused ? "paused" : "active"}">${label}</span>`,
    )
    .join("");
}

function detailRow(asset, index) {
  const underlyingLink = asset.underlying
    ? `<a href="${asset.explorer}/address/${asset.underlying}" target="_blank" rel="noreferrer">${escapeHtml(asset.underlying)}</a>`
    : "Native asset";
  return `<tr id="detail-${index}" class="detailRow" hidden>
    <td colspan="10">
      <dl class="detailsGrid">
        <div><dt>iToken name</dt><dd>${escapeHtml(asset.iName)}</dd></div>
        <div><dt>iToken decimals</dt><dd>${asset.iDecimals}</dd></div>
        <div><dt>Underlying</dt><dd class="mono">${underlyingLink}</dd></div>
        <div><dt>Underlying decimals</dt><dd>${asset.decimals}</dd></div>
        <div><dt>Exchange rate</dt><dd>${amount(asset.exchangeRate)}</dd></div>
        <div><dt>Interest model</dt><dd class="mono"><a href="${asset.explorer}/address/${asset.interestRateModel}" target="_blank" rel="noreferrer">${escapeHtml(shortAddress(asset.interestRateModel))}</a></dd></div>
        <div><dt>sMode ID / label</dt><dd>${asset.sModeID} · ${escapeHtml(asset.sModeLabel || "None")}</dd></div>
        <div><dt>sMode LTV / LT</dt><dd>${percent(asset.sModeLTV)} / ${percent(asset.sModeLiquidationThreshold)}</dd></div>
        <div><dt>sMode close factor</dt><dd>${percent(asset.sModeCloseFactor)}</dd></div>
        <div><dt>sMode liquidation incentive</dt><dd>${percent(asset.sModeLiquidationIncentive)}</dd></div>
        <div><dt>Segregation borrowable</dt><dd>${asset.borrowableInSegregation === null ? "-" : asset.borrowableInSegregation ? "Yes" : "No"}</dd></div>
        <div><dt>Debt ceiling / current debt</dt><dd>${amount(asset.debtCeiling)} / ${amount(asset.currentDebt)}</dd></div>
      </dl>
    </td>
  </tr>`;
}

function marketRow(asset, index) {
  const suppliedUsd =
    asset.priceUsd === null ? NaN : Number(asset.suppliedUnderlying) * asset.priceUsd;
  const borrowedUsd =
    asset.priceUsd === null ? NaN : Number(asset.totalBorrows) * asset.priceUsd;
  return `<tr>
    <td><strong>${escapeHtml(asset.chainName)}</strong></td>
    <td class="assetIdentity">
      <strong>${escapeHtml(asset.symbol)}</strong>
      <small>${escapeHtml(asset.name)} · ${escapeHtml(asset.iSymbol)}</small>
      <small class="mono"><a href="${asset.explorer}/address/${asset.address}" target="_blank" rel="noreferrer">${escapeHtml(shortAddress(asset.address))}</a></small>
    </td>
    <td>${usd(asset.priceUsd)}<small class="${asset.priceStatus ? "okText" : "warnText"}">${asset.priceStatus ? "Oracle OK" : "Price unavailable"}</small></td>
    <td>${amount(asset.suppliedUnderlying, true)} · ${usd(suppliedUsd)}<small>${amount(asset.totalSupply, true)} iTokens</small></td>
    <td>${amount(asset.totalBorrows, true)} · ${usd(borrowedUsd)}<small>Cash ${amount(asset.cash, true)} · reserves ${amount(asset.totalReserves, true)} · util ${percent(asset.utilization)}</small></td>
    <td>LTV ${percent(asset.ltv)} · LT ${percent(asset.liquidationThreshold)}<small>BF ${percent(asset.borrowFactor)} · reserve ${percent(asset.reserveRatio)}</small></td>
    <td>Supply ${cap(asset.supplyCapacity)}<small>Borrow ${cap(asset.borrowCapacity)}</small></td>
    <td><div class="flagList">${statusFlags(asset)}</div></td>
    <td>${asset.sModeID ? escapeHtml(asset.sModeLabel || `Mode ${asset.sModeID}`) : "None"}<small>${asset.sModeID ? `ID ${asset.sModeID}` : "Normal mode"}</small></td>
    <td><button class="detailButton" type="button" data-detail="detail-${index}" aria-expanded="false">Details</button></td>
  </tr>${detailRow(asset, index)}`;
}

function renderRows() {
  if (!state.snapshot) return;
  const selectedStatus = els.statusFilter.value;
  const query = els.search.value.trim().toLowerCase();
  const assets = state.snapshot.assets.filter((asset) => {
    if (!state.selectedChains.has(asset.chain)) return false;
    const zeroFilterMatch = matchesZeroFilter(asset, selectedStatus);
    if (zeroFilterMatch === false) return false;
    if (
      selectedStatus !== "all" &&
      zeroFilterMatch === null &&
      status(asset) !== selectedStatus
    )
      return false;
    if (
      query &&
      ![asset.name, asset.symbol, asset.iSymbol, asset.address, asset.underlying]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    )
      return false;
    return true;
  });

  els.rows.innerHTML = assets.length
    ? assets.map(marketRow).join("")
    : '<tr><td class="empty" colspan="10">No markets match the filters.</td></tr>';
}

function render() {
  const data = state.snapshot;
  if (state.selectedChains === null) {
    state.selectedChains = new Set(data.chains.map((chain) => chain.key));
  }
  const supplied = data.assets.reduce(
    (sum, asset) => sum + Number(asset.suppliedUnderlying || 0) * (asset.priceUsd || 0),
    0,
  );
  const borrowed = data.assets.reduce(
    (sum, asset) => sum + Number(asset.totalBorrows || 0) * (asset.priceUsd || 0),
    0,
  );
  els.chainCount.textContent = `${data.healthyChainCount}/${data.chainCount}`;
  els.marketCount.textContent = data.marketCount.toLocaleString();
  els.suppliedValue.textContent = usd(supplied);
  els.borrowedValue.textContent = usd(borrowed);
  els.meta.textContent = `Updated ${new Date(data.generatedAt).toLocaleString()} · refreshes every 30 min`;
  els.chainBreakdown.innerHTML = data.chains
    .map((chain) => {
      if (chain.status === "error") {
        return `<div><strong>${escapeHtml(chain.name)}</strong><span>Unavailable</span></div>`;
      }
      const chainAssets = data.assets.filter((asset) => asset.chain === chain.key);
      const chainSupplied = chainAssets.reduce(
        (sum, asset) =>
          sum + Number(asset.suppliedUnderlying || 0) * (asset.priceUsd || 0),
        0,
      );
      const chainBorrowed = chainAssets.reduce(
        (sum, asset) =>
          sum + Number(asset.totalBorrows || 0) * (asset.priceUsd || 0),
        0,
      );
      return `<div><strong>${escapeHtml(chain.name)}</strong><span>S ${usd(chainSupplied)} · B ${usd(chainBorrowed)}</span></div>`;
    })
    .join("");

  els.chainToggles.innerHTML = data.chains
    .map(
      (chain) => `<label class="chainToggle">
        <input type="checkbox" value="${chain.key}" ${state.selectedChains.has(chain.key) ? "checked" : ""} />
        <span>${escapeHtml(chain.name)}</span>
        <small>${chain.marketCount}</small>
      </label>`,
    )
    .join("");

  const failures = data.chains.filter((chain) => chain.status === "error");
  els.chainErrors.hidden = failures.length === 0;
  els.chainErrors.innerHTML = failures
    .map(
      (chain) =>
        `<strong>${escapeHtml(chain.name)}</strong>: ${escapeHtml(chain.error)}`,
    )
    .join("<br />");
  renderRows();
}

async function load(force = false) {
  els.refresh.disabled = true;
  els.refresh.textContent = "Loading";
  try {
    const response = await fetch(`${apiBase}/api/markets${force ? "?refresh=1" : ""}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    state.snapshot = data;
    render();
  } catch (error) {
    els.meta.textContent = "Market data failed to load.";
    els.rows.innerHTML = `<tr><td class="error" colspan="10">${escapeHtml(error.message)}</td></tr>`;
  } finally {
    els.refresh.disabled = false;
    els.refresh.textContent = "Refresh";
  }
}

els.refresh.addEventListener("click", () => load(true));
els.chainToggles.addEventListener("change", (event) => {
  if (event.target.checked) state.selectedChains.add(event.target.value);
  else state.selectedChains.delete(event.target.value);
  renderRows();
});
els.selectAllChains.addEventListener("click", () => {
  state.selectedChains = new Set(state.snapshot.chains.map((chain) => chain.key));
  render();
});
els.selectNoChains.addEventListener("click", () => {
  state.selectedChains.clear();
  render();
});
els.statusFilter.addEventListener("change", renderRows);
els.search.addEventListener("input", renderRows);
els.rows.addEventListener("click", (event) => {
  const button = event.target.closest("[data-detail]");
  if (!button) return;
  const row = document.querySelector(`#${button.dataset.detail}`);
  const expanded = button.getAttribute("aria-expanded") === "true";
  button.setAttribute("aria-expanded", String(!expanded));
  button.textContent = expanded ? "Details" : "Close";
  row.hidden = expanded;
});

load();
state.timer = window.setInterval(() => load(true), 1800000);
