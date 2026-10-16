import { useState } from "react";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Copy,
  ExternalLink,
  Info,
  LockKeyhole,
  LogOut,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react";
import { initialEpochs, product } from "./data";

const money = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function Header({ page, setPage, walletOpen, setWalletOpen, menuOpen, setMenuOpen }) {
  return (
    <header className="site-header">
      <button className="mobile-menu" aria-label="Open menu" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <X size={26} /> : <Menu size={28} />}
      </button>
      <button className="brand-button" onClick={() => setPage("earn")} aria-label="dForce home">
        <img src="/assets/dforce-logo.svg" alt="dForce" />
      </button>
      <nav className={menuOpen ? "main-nav open" : "main-nav"}>
        <button className={page !== "borrow" ? "active" : ""} onClick={() => { setPage("earn"); setMenuOpen(false); }}>Earn</button>
        <button className={page === "borrow" ? "active" : ""} onClick={() => { setPage("borrow"); setMenuOpen(false); }}>Borrow</button>
      </nav>
      <div className="header-actions">
        <button className="network-button">
          <img src="/assets/conflux.svg" alt="" />
          <span>Conflux eSpace</span>
          <ChevronDown size={15} />
        </button>
        <button className="wallet-button" onClick={() => setWalletOpen(!walletOpen)}>
          <img src="/assets/metamask.svg" alt="" />
          <span>0x9d...3542</span>
        </button>
      </div>
    </header>
  );
}

function AccountModal({ onClose }) {
  const [copied, setCopied] = useState(false);
  return (
    <Modal onClose={onClose} className="account-modal">
      <h3>Account</h3>
      <div className="account-box">
        <div className="account-connection">
          <span>Connected with Browser Wallet</span>
          <button className="text-button"><LogOut size={16} /> Disconnect</button>
        </div>
        <div className="account-address"><img src="/assets/metamask.svg" alt="" />0x9df...3542</div>
        <div className="account-links">
          <button onClick={() => setCopied(true)}><Copy size={16} />{copied ? "Copied" : "Copy address"}</button>
          <button><ExternalLink size={16} />View on Explorer</button>
        </div>
      </div>
      <div className="transactions-title"><strong>Transactions</strong><button>Clear all</button></div>
      <div className="empty-transactions">No recent transactions</div>
    </Modal>
  );
}

function Modal({ children, onClose, className = "" }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className={`modal ${className}`} role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal-close" aria-label="Close" onClick={onClose}><X size={21} /></button>
        {children}
      </section>
    </div>
  );
}

function Footer() {
  return (
    <footer>
      <div><strong>Contact</strong><a href="mailto:contact@dforce.network">contact@dforce.network</a><div className="socials"><img src="/assets/twitter.svg" alt="X" /><img src="/assets/telegram.svg" alt="Telegram" /><img src="/assets/discord.svg" alt="Discord" /><img src="/assets/medium.svg" alt="Medium" /><img src="/assets/github.svg" alt="Github" /></div></div>
      <div><strong>Governance</strong><a href="#stake">Stake</a><a href="#lock">Lock-up</a><a href="#vote">Vote</a></div>
      <div><strong>Products</strong><a href="#maxshot">Maxshot</a><a href="#unitus">Unitus Finance</a><a href="#bridge">Bridge</a></div>
      <div><strong>About</strong><a href="#docs">Docs</a><a href="#careers">Careers</a></div>
    </footer>
  );
}

function PositionMetric({ icon, value, label }) {
  return <div className="position-metric"><img src={icon} alt="" /><strong>{value}</strong><span>{label}</span></div>;
}

function EarnPage({ onOpenVault }) {
  return (
    <main className="page-shell earn-page">
      <h1>My Position</h1>
      <section className="position-grid">
        <PositionMetric icon="/assets/my-deposits.svg" value="$24.85K" label="My Deposits" />
        <PositionMetric icon="/assets/7d-apy.svg" value="8.00%" label="7-D APY" />
        <PositionMetric icon="/assets/30d-apy.svg" value="8.00%" label="30-D APY" />
      </section>
      <section className="market-table-wrap">
        <table className="market-table">
          <thead><tr><th>Vault</th><th>Start At <Info size={12} /></th><th>APY</th><th>Deposits</th><th>Supply Cap</th><th>Curator</th><th>Collateral</th></tr></thead>
          <tbody>
            <tr className="clickable-row" onClick={onOpenVault}>
              <td data-label="Vault"><div className="asset-name"><img src="/assets/usdt.svg" alt="" /><div><strong>{product.name}</strong><span>{product.matureAt} (Interest Period)</span></div></div></td>
              <td data-label="Start At"><strong>{product.startAt}</strong><span>Weekly Withdrawal</span></td>
              <td data-label="APY"><strong>8%</strong></td>
              <td data-label="Deposits"><strong>{product.totalDepositsToken}</strong><span>{product.totalDeposits}</span></td>
              <td data-label="Supply Cap"><strong>{product.supplyCap}</strong></td>
              <td data-label="Curator"><img className="partner-logo" src="/assets/conflux-foundation.svg" alt="Conflux Foundation" /></td>
              <td data-label="Collateral"><div className="partner-name"><img src="/assets/fin-loop.svg" alt="" />{product.collateral}</div></td>
            </tr>
            <tr className="muted-row">
              <td><div className="asset-name"><img src="/assets/usdt.svg" alt="" /><div><strong>Conflux RWA - EAG S2</strong><span>22 Dec 2025 (Matured)</span></div></div></td>
              <td><strong>20:00, 22 Sep 2025</strong><span>Withdrawal Period</span></td><td><strong>8%</strong></td><td><strong>1.08K</strong><span>$1.08K</span></td><td><strong>300.00K</strong></td><td><img className="partner-logo" src="/assets/conflux-foundation.svg" alt="Conflux Foundation" /></td><td><div className="partner-name"><img src="/assets/eagle-power.svg" alt="" />Eagle Power</div></td>
            </tr>
            <tr className="coming-row"><td><div className="asset-name muted"><img src="/assets/dforce-logo.svg" alt="" /><strong>dForce Vault</strong></div></td><td colSpan="6">Coming soon...</td></tr>
          </tbody>
        </table>
      </section>
    </main>
  );
}

function BorrowPage({ notify }) {
  return (
    <main className="page-shell borrow-page">
      <h1>My Assets</h1>
      <section className="asset-summary"><div><strong>$0.00</strong><span>Total Supply</span></div><div><strong>$0.00</strong><span>Total Debts</span></div><div><strong>...</strong><span>Adequacy Ratio</span></div></section>
      <section className="borrow-panels"><div><h3>Supplies</h3><p>Nothing supplied yet</p></div><div><h3>Borrows</h3><p>Nothing borrowed yet</p></div></section>
      <section className="market-card"><h3>Markets</h3><div className="borrow-table-header"><span>Assets</span><span>Supply APY</span><span>Borrow APY</span><span>Market Size</span><span>Liquidity</span><span>Wallet</span><span /></div>
        <div className="borrow-row"><div className="asset-name"><img src="/assets/usdt.svg" alt="" /><div><strong>USDT</strong><span>22 Dec 2026</span></div></div><span className="positive">8.00%</span><span className="negative">8.00%</span><span>184.72K<small>$184.72K</small></span><span>92.40K<small>$92.40K</small></span><span>12.42K</span><div className="row-actions"><button onClick={() => notify("Existing borrow flow is unchanged in this prototype.")}>Borrow</button><button onClick={() => notify("Existing repay flow is unchanged in this prototype.")}>Repay</button></div></div>
      </section>
    </main>
  );
}

function PercentButtons({ max, onChange, disabled = false }) {
  return <div className="percent-buttons">{[25, 50, 75, 100].map((percent) => <button key={percent} disabled={disabled} onClick={() => onChange((max * percent / 100).toFixed(2))}>{percent}%</button>)}</div>;
}

function AmountPanel({ mode, amount, setAmount, onSubmit, availableToRequest, productState }) {
  const isSupply = mode === "supply";
  const isLastEpoch = productState === "last" && !isSupply;
  const isMatured = productState === "matured" && !isSupply;
  const max = isSupply ? product.walletBalance : availableToRequest;
  return (
    <div className="amount-panel">
      <div className="amount-balance"><span>{isSupply ? "USDT Balance" : isMatured ? "Available to Withdraw" : isLastEpoch ? "Accruing balance" : "Available to Request"}</span><strong>{money.format(max)}</strong></div>
      <div className="amount-input"><input inputMode="decimal" disabled={isLastEpoch} value={amount} placeholder="0.00" onChange={(event) => setAmount(event.target.value.replace(/[^0-9.]/g, ""))} /><span>Amount</span></div>
      <PercentButtons max={max} onChange={setAmount} disabled={isLastEpoch} />
      {!isSupply && productState === "regular" && <div className="anchor-note"><CalendarClock size={17} /><span>Available after</span><strong>{product.nextAnchor} UTC</strong></div>}
      {isLastEpoch && <div className="maturity-notice"><CalendarClock size={18} /><span>Withdraw will be available upon maturity for the last epoch.</span><strong>{product.maturityAt} UTC</strong></div>}
      {isMatured && <div className="anchor-note"><CheckCircle2 size={17} /><span>Interest period ended</span><strong>Direct withdrawal is available</strong></div>}
      <button className="primary-action" disabled={isLastEpoch || !Number(amount)} onClick={onSubmit}>{isSupply ? "Supply" : isMatured ? "Withdraw" : isLastEpoch ? "Available at Maturity" : "Request Withdrawal"}</button>
    </div>
  );
}

function StateSimulator({ productState, onChange }) {
  return (
    <section className="state-simulator" aria-label="Prototype state simulator">
      <span>Prototype state</span>
      <div>{[["regular", "Regular epoch"], ["last", "Last epoch"], ["matured", "Matured"]].map(([value, label]) => <button key={value} className={productState === value ? "active" : ""} onClick={() => onChange(value)}>{label}</button>)}</div>
    </section>
  );
}

function ProductSchedule() {
  return <div className="schedule-strip"><div><Clock3 size={18} /><span>Interest period</span><strong>22 Sep — 22 Dec 2026</strong></div><div><CalendarClock size={18} /><span>Interest cutoff &amp; withdrawal anchor</span><strong>Every Tuesday, 20:00 UTC</strong></div><div><ShieldCheck size={18} /><span>At maturity</span><strong>Direct redeem resumes</strong></div></div>;
}

function EpochList({ epochs, onClaim, emptyMessage = "No active withdrawal requests." }) {
  const pendingEpoch = epochs.find((epoch) => epoch.status === "Pending");
  const claimableEpochs = epochs.filter((epoch) => epoch.status === "Claimable");
  const latestClaimableEpoch = claimableEpochs.reduce(
    (latest, epoch) => !latest || epoch.id > latest.id ? epoch : latest,
    null,
  );
  const claimableEpoch = latestClaimableEpoch && {
    id: "claimable",
    anchor: latestClaimableEpoch.anchor,
    epochIds: claimableEpochs.map((epoch) => epoch.id),
    receivable: claimableEpochs.reduce((sum, epoch) => sum + epoch.receivable, 0),
    status: "Claimable",
  };
  const displayedEpochs = [pendingEpoch, claimableEpoch].filter(Boolean);

  return (
    <section className="epoch-section">
      <div className="section-title"><div><h2>Withdrawal requests</h2><p>Requests for the same withdrawal window merge automatically. Interest stops exactly at the anchor.</p></div></div>
      {displayedEpochs.length ? <div className="epoch-table">
        <div className="epoch-head"><span>Available time</span><span>Amount</span><span>Status</span><span /></div>
        {displayedEpochs.map((epoch) => <div className="epoch-row" key={epoch.id}><div><strong>{epoch.status === "Claimable" ? "Available since" : "Estimated available"}</strong><span>{epoch.anchor} UTC</span></div><div className="epoch-amount"><strong>{money.format(epoch.status === "Claimable" ? epoch.receivable : epoch.requested)} USDT</strong><span>{epoch.status === "Claimable" ? "Exact claimable amount" : "Final settlement will be slightly higher than requested"}</span></div><span className={`status ${epoch.status.toLowerCase()}`}>{epoch.status}</span><div>{epoch.status === "Claimable" ? <button className="claim-button" onClick={() => onClaim(epoch)}>Claim</button> : <LockKeyhole size={18} />}</div></div>)}
      </div> : <div className="empty-requests"><CheckCircle2 size={22} /><strong>{emptyMessage}</strong></div>}
    </section>
  );
}

function VaultPage({ onBack, notify }) {
  const [mode, setMode] = useState("withdraw");
  const [amount, setAmount] = useState("");
  const [epochs, setEpochs] = useState(initialEpochs);
  const [confirm, setConfirm] = useState(null);
  const [productState, setProductState] = useState("regular");
  const [suppliedBalance, setSuppliedBalance] = useState(product.supplied);

  const pendingBalance = epochs.filter((epoch) => epoch.status === "Pending").reduce((sum, epoch) => sum + epoch.requested, 0);
  const claimableBalance = epochs.filter((epoch) => epoch.status === "Claimable").reduce((sum, epoch) => sum + epoch.receivable, 0);
  const accruingBalance = Math.max(0, suppliedBalance - pendingBalance - claimableBalance);

  function changeProductState(nextState) {
    setProductState(nextState);
    setMode("withdraw");
    setAmount("");
    setConfirm(null);
    setSuppliedBalance(product.supplied);

    if (nextState === "regular") {
      setEpochs(initialEpochs);
    } else {
      setEpochs(initialEpochs.map((epoch) => epoch.status === "Pending" ? { ...epoch, status: "Claimable" } : epoch));
    }
  }

  function submitAmount() {
    if (!Number(amount) || (productState === "last" && mode === "withdraw")) return;
    setConfirm({ type: mode === "withdraw" && productState === "matured" ? "redeem" : mode, amount: Number(amount) });
  }

  function confirmAction() {
    if (confirm.type === "withdraw") {
      setEpochs((current) => current.map((epoch) => epoch.id === 42 ? { ...epoch, requested: epoch.requested + confirm.amount, receivable: epoch.receivable + confirm.amount * 1.006904 } : epoch));
      notify("Withdrawal request added to the pending withdrawal.");
    } else if (confirm.type === "supply") {
      setSuppliedBalance((current) => current + confirm.amount);
      notify(`${money.format(confirm.amount)} USDT supplied successfully.`);
    } else {
      setSuppliedBalance((current) => Math.max(0, current - confirm.amount));
      notify(`${money.format(confirm.amount)} USDT withdrawn successfully.`);
    }
    setAmount("");
    setConfirm(null);
  }

  function confirmClaim() {
    const epoch = confirm.epoch;
    setEpochs((current) => current.map((item) => epoch.epochIds.includes(item.id) ? { ...item, status: "Claimed" } : item));
    setSuppliedBalance((current) => Math.max(0, current - epoch.receivable));
    setConfirm(null);
    notify("Withdrawal settled and claimed.");
  }

  return (
    <main className="page-shell vault-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={16} />Back</button>
      <StateSimulator productState={productState} onChange={changeProductState} />
      <section className="vault-card">
        <div className="vault-intro"><div><h1>{product.name}</h1><a href="#curator">by {product.curator} <ExternalLink size={14} /></a></div><span className="phase-badge">{productState === "regular" ? "Interest Period" : productState === "last" ? "Last Epoch" : "Matured"}</span></div>
        <p className="vault-description">A fixed-term, fixed-interest USDT Vault created and managed by the Conflux Foundation. Deposits remain open through the interest period, subject to the supply cap. Withdrawal requests are processed at a fixed weekly UTC anchor, when their interest stops accruing exactly. <a href="#learn">Learn More</a></p>
        <ProductSchedule />
        <div className="vault-grid">
          <section className="action-card">
            <div className="supplied-title"><span><img src="/assets/usdt.svg" alt="" />USDT Supplied</span><strong>{money.format(suppliedBalance)}</strong></div>
            <div className="action-tabs"><button disabled={productState === "matured"} className={mode === "supply" ? "active" : ""} onClick={() => { setMode("supply"); setAmount(""); }}>Supply</button><button className={mode === "withdraw" ? "active" : ""} onClick={() => { setMode("withdraw"); setAmount(""); }}>{productState === "regular" ? "Withdraw Request" : "Withdraw"}</button></div>
            <AmountPanel mode={mode} amount={amount} setAmount={setAmount} onSubmit={submitAmount} availableToRequest={accruingBalance} productState={productState} />
          </section>
          <section className="vault-stats"><dl><div><dt>Total Deposits</dt><dd>{product.totalDeposits}</dd></div><div><dt>Liquidity</dt><dd>{product.liquidity}</dd></div><div><dt>Fixed APY</dt><dd>{product.apy}</dd></div></dl><EpochList epochs={epochs} onClaim={(epoch) => setConfirm({ type: "claim", epoch })} emptyMessage={productState === "matured" ? "No queued withdrawals. Remaining funds are available for direct withdrawal." : productState === "last" ? "All claimable withdrawals have been completed." : "No active withdrawal requests."} /></section>
        </div>
      </section>
      {confirm?.type === "withdraw" && <Modal onClose={() => setConfirm(null)} className="confirm-modal"><CalendarClock className="modal-icon" size={34} /><h3>Confirm withdrawal request</h3><p>Your request cannot be cancelled. The requested funds earn interest until the weekly anchor and stop accruing exactly at that time.</p><div className="confirm-details"><div><span>Request amount</span><strong>{money.format(confirm.amount)} USDT</strong></div><div><span>Interest cutoff &amp; withdrawal anchor</span><strong>{product.nextAnchor} UTC</strong></div></div><button className="primary-action" onClick={confirmAction}>Confirm Request</button></Modal>}
      {confirm?.type === "supply" && <Modal onClose={() => setConfirm(null)} className="confirm-modal"><CircleDollarSign className="modal-icon" size={34} /><h3>Confirm supply</h3><p>This prototype simulates the existing Unitus supply flow.</p><div className="confirm-details"><div><span>Supply amount</span><strong>{money.format(confirm.amount)} USDT</strong></div><div><span>Fixed APY</span><strong>{product.apy}</strong></div></div><button className="primary-action" onClick={confirmAction}>Confirm Supply</button></Modal>}
      {confirm?.type === "redeem" && <Modal onClose={() => setConfirm(null)} className="confirm-modal"><CircleDollarSign className="modal-icon" size={34} /><h3>Confirm withdrawal</h3><p>The product has matured and interest has stopped. Your funds are available for direct withdrawal.</p><div className="confirm-details"><div><span>Withdrawal amount</span><strong>{money.format(confirm.amount)} USDT</strong></div></div><button className="primary-action" onClick={confirmAction}>Confirm Withdrawal</button></Modal>}
      {confirm?.type === "claim" && <Modal onClose={() => setConfirm(null)} className="confirm-modal"><CheckCircle2 className="modal-icon" size={34} /><h3>Settle and claim withdrawal</h3><p>Interest stopped by {confirm.epoch.anchor} UTC. This claim settles all included withdrawal windows; settlement timing does not change the receivable. If liquidity is insufficient, the entire action fails and can be retried later.</p><div className="confirm-details"><div><span>Exact claimable amount</span><strong>{money.format(confirm.epoch.receivable)} USDT</strong></div></div><button className="primary-action" onClick={confirmClaim}>Settle &amp; Claim</button></Modal>}
    </main>
  );
}

function Toast({ message }) {
  return <div className="toast"><CheckCircle2 size={19} />{message}</div>;
}

export function App() {
  const [page, setPage] = useState("earn");
  const [walletOpen, setWalletOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState("");

  function notify(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  }

  return (
    <div className="app">
      <Header page={page} setPage={setPage} walletOpen={walletOpen} setWalletOpen={setWalletOpen} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      {page === "earn" && <EarnPage onOpenVault={() => setPage("vault")} />}
      {page === "vault" && <VaultPage onBack={() => setPage("earn")} notify={notify} />}
      {page === "borrow" && <BorrowPage notify={notify} />}
      <Footer />
      {walletOpen && <AccountModal onClose={() => setWalletOpen(false)} />}
      {toast && <Toast message={toast} />}
    </div>
  );
}
