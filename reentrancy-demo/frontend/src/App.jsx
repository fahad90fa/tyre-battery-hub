import { useDemo } from "./hooks/useDemo.js";
import ConnectPanel from "./components/ConnectPanel.jsx";
import DeployPanel from "./components/DeployPanel.jsx";
import TargetToggle from "./components/TargetToggle.jsx";
import InteractionPanel from "./components/InteractionPanel.jsx";
import AttackPanel from "./components/AttackPanel.jsx";
import BalancesPanel from "./components/BalancesPanel.jsx";
import StatsPanel from "./components/StatsPanel.jsx";
import FlowDiagram from "./components/FlowDiagram.jsx";
import TxHistoryTable from "./components/TxHistoryTable.jsx";
import TransactionLog from "./components/TransactionLog.jsx";
import { HARDHAT_CHAIN_ID } from "./constants.js";

const shortAddr = (a) => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "");

export default function App() {
  const demo = useDemo();
  const connected = Boolean(demo.mode);
  const wrongChain = connected && demo.chainId !== HARDHAT_CHAIN_ID;

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-badge">⛓️‍💥</span>
          <div>
            <h1>Interactive Reentrancy Attack Demo</h1>
            <p className="subtitle">
              Vulnerable vs. hardened smart contracts on a local Hardhat chain — for
              classroom use only.
            </p>
          </div>
        </div>
        <div className="conn-status">
          {connected ? (
            <>
              <span className={`dot ${wrongChain ? "warn" : "ok"}`} />
              <div className="conn-meta">
                <strong>
                  {demo.mode === "metamask" ? "MetaMask" : "Local dev wallet"}
                </strong>
                <code>{shortAddr(demo.account)}</code>
                <span className="chip">chain {demo.chainId ?? "?"}</span>
              </div>
            </>
          ) : (
            <span className="chip muted">Not connected</span>
          )}
        </div>
      </header>

      {demo.error && (
        <div className="banner error">
          <strong>Error:</strong> {demo.error}
        </div>
      )}
      {wrongChain && (
        <div className="banner warn">
          Wallet is on chain {demo.chainId}. Switch it to the Hardhat network
          (chainId {HARDHAT_CHAIN_ID}) for the demo to work.
        </div>
      )}

      {!connected ? (
        <ConnectPanel demo={demo} />
      ) : (
        <main className="grid">
          <section className="col">
            <DeployPanel demo={demo} />
            <TargetToggle demo={demo} />
            <InteractionPanel demo={demo} />
            <AttackPanel demo={demo} />
          </section>
          <section className="col">
            <BalancesPanel demo={demo} />
            <StatsPanel demo={demo} />
            <FlowDiagram demo={demo} />
            <TxHistoryTable demo={demo} />
            <TransactionLog demo={demo} />
          </section>
        </main>
      )}

      <footer className="footer">
        <span>
          Educational project · runs entirely on <code>localhost:8545</code> · no real
          funds, no real network.
        </span>
      </footer>
    </div>
  );
}
