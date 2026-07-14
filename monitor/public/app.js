const state = {
  snapshot: null,
  filtered: [],
  poll: null,
};

const apiBase = window.location.protocol === "file:" ? "http://127.0.0.1:5177" : "";

const fmtUsd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const fmtAmount = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 6,
});

const fmtPct = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 2,
});

const els = {
  meta: document.querySelector("#meta"),
  refresh: document.querySelector("#refresh"),
  positionCount: document.querySelector("#positionCount"),
  totalBorrowed: document.querySelector("#totalBorrowed"),
  totalShortfall: document.querySelector("#totalShortfall"),
  liquidatable: document.querySelector("#liquidatable"),
  staleLocal: document.querySelector("#staleLocal"),
  borrowFilter: document.querySelector("#borrowFilter"),
  statusFilter: document.querySelector("#statusFilter"),
  search: document.querySelector("#search"),
  positions: document.querySelector("#positions"),
  scan: document.querySelector("#scan"),
};

function assetList(items) {
  if (!items.length) return "-";
  return `<div class="assetList">${items
    .map((item) => {
      const factor =
        item.liquidationThreshold !== undefined
          ? ` LT ${fmtPct.format(item.liquidationThreshold)}`
          : item.borrowFactor !== undefined
            ? ` BF ${fmtPct.format(item.borrowFactor)}`
            : "";
      return `<div class="assetLine">
        <strong>${item.asset}</strong>
        <span>${fmtAmount.format(item.amount)} / ${fmtUsd.format(item.usd)}${factor}</span>
      </div>`;
    })
    .join("")}</div>`;
}

function renderRows() {
  const minBorrow = Number(els.borrowFilter.value);
  const status = els.statusFilter.value;
  const query = els.search.value.trim().toLowerCase();

  state.filtered = state.snapshot.positions.filter((row) => {
    if (row.borrowedUsd <= minBorrow) return false;
    if (status !== "all" && row.status !== status) return false;
    if (query && !row.account.toLowerCase().includes(query)) return false;
    return true;
  });

  if (!state.filtered.length) {
    els.positions.innerHTML = `<tr><td class="empty" colspan="6">No positions match the filters.</td></tr>`;
    return;
  }

  els.positions.innerHTML = state.filtered
    .map(
      (row) => {
        const protocolNote =
          row.protocolStatus && row.protocolStatus !== row.status
            ? `<small>local ${row.protocolStatus}</small>`
            : "";
        return `<tr>
          <td class="mono">${row.account}</td>
          <td><span class="status ${row.status}">${row.status}</span>${protocolNote}</td>
          <td>${fmtUsd.format(row.equityUsd)}<small>local ${fmtUsd.format(row.protocolEquityUsd || 0)}</small></td>
          <td>${fmtUsd.format(row.shortfallUsd)}<small>local ${fmtUsd.format(row.protocolShortfallUsd || 0)}</small></td>
          <td>${assetList(row.deposits)}</td>
          <td>${assetList(row.borrows)}</td>
        </tr>`;
      },
    )
    .join("");
}

function refreshMeta(data) {
  const scanText = data.scannedThisRefresh
    ? `scanned logs from ${data.incrementalStartBlock.toLocaleString()}`
    : `borrowers cached through ${data.scannedToBlock.toLocaleString()}`;
  return `Block ${data.latestBlock.toLocaleString()} · simulated to ${data.simulatedToBlock.toLocaleString()} · ${scanText} · ${new Date(
    data.generatedAt,
  ).toLocaleString()}`;
}

function renderSnapshot() {
  const data = state.snapshot;
  els.positionCount.textContent = data.positionCount.toLocaleString();
  els.totalBorrowed.textContent = fmtUsd.format(data.totals.borrowedUsd);
  els.totalShortfall.textContent = fmtUsd.format(data.totals.shortfallUsd);
  els.liquidatable.textContent = data.totals.liquidatable.toLocaleString();
  els.staleLocal.textContent = (data.totals.staleLocal || 0).toLocaleString();
  els.meta.textContent = refreshMeta(data);
  renderRows();
}

async function load(options = {}) {
  const {refresh = false, scan = false} = options;
  els.refresh.disabled = true;
  els.scan.disabled = true;
  els.refresh.textContent = refresh ? "Loading" : "Refresh Positions";
  els.scan.textContent = scan ? "Scanning" : "Scan Logs + Refresh";
  try {
    const params = new URLSearchParams();
    if (refresh) params.set("refresh", "1");
    if (scan) params.set("scan", "1");
    const query = params.toString() ? `?${params.toString()}` : "";
    const response = await fetch(`${apiBase}/api/positions${query}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const body = await response.json();
    if (body.error) throw new Error(body.error);
    if (body.loading) {
      const progress = body.progress || {};
      const details =
        progress.totalChunks > 0
          ? `${progress.status}: ${progress.completedChunks || 0}/${progress.totalChunks} chunks, ${progress.borrowers || 0} borrowers`
          : progress.totalMarkets > 0
            ? `${progress.status}: ${progress.currentMarket || 0}/${progress.totalMarkets} markets`
          : progress.totalAccounts > 0
            ? `${progress.status}: ${progress.checkedAccounts || 0}/${progress.totalAccounts} accounts`
            : progress.status || "loading";
      els.meta.textContent = `Loading positions... ${details}`;
      if (!state.poll) {
        state.poll = setInterval(() => load({refresh: false}), 2500);
      }
      return;
    }
    if (state.poll) {
      clearInterval(state.poll);
      state.poll = null;
    }
    state.snapshot = body;
    renderSnapshot();
  } catch (error) {
    els.positions.innerHTML = `<tr><td class="error" colspan="6">${error.message}. Open http://127.0.0.1:5177 instead of this file directly, and make sure npm run monitor:unitus is running.</td></tr>`;
    els.meta.textContent = "Failed to load positions.";
  } finally {
    els.refresh.disabled = false;
    els.scan.disabled = false;
    els.refresh.textContent = "Refresh Positions";
    els.scan.textContent = "Scan Logs + Refresh";
  }
}

els.refresh.addEventListener("click", () => load({refresh: true}));
els.scan.addEventListener("click", () => load({refresh: true, scan: true}));
els.borrowFilter.addEventListener("change", renderRows);
els.statusFilter.addEventListener("change", renderRows);
els.search.addEventListener("input", renderRows);

load();
