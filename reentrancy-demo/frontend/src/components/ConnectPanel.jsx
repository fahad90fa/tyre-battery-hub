import { RPC_URL } from "../constants.js";

export default function ConnectPanel({ demo }) {
  const busy = demo.busy === "connect";
  return (
    <div className="connect-hero">
      <div className="card connect-card">
        <h2>Connect to the local chain</h2>
        <p className="muted">
          Pick how you want to sign transactions. Both talk to the same Hardhat node at{" "}
          <code>{RPC_URL}</code>.
        </p>

        <div className="connect-options">
          <button className="btn primary big" disabled={busy} onClick={demo.connectLocal}>
            <span className="btn-title">Local dev wallet</span>
            <span className="btn-sub">Zero setup — uses a built-in Hardhat account</span>
          </button>
          <button className="btn ghost big" disabled={busy} onClick={demo.connectMetaMask}>
            <span className="btn-title">MetaMask</span>
            <span className="btn-sub">Sign each step yourself in the extension</span>
          </button>
        </div>

        <div className="prereq">
          <h3>Before you connect</h3>
          <ol>
            <li>
              In the <code>reentrancy-demo</code> folder run{" "}
              <code>npm run chain</code> to start the local blockchain.
            </li>
            <li>
              Leave it running, then click <strong>Local dev wallet</strong> (or connect
              MetaMask to the Hardhat network).
            </li>
            <li>Deploy the contracts, seed victims, then run the attack.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
