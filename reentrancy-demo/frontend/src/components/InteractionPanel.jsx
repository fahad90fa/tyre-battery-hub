import { useState } from "react";

export default function InteractionPanel({ demo }) {
  const [amount, setAmount] = useState("1");
  const deployed = Boolean(demo.addresses.vulnerable);

  return (
    <div className="card">
      <div className="card-head">
        <h2>3 · Act as an honest user</h2>
      </div>
      <p className="hint">
        Optional: deposit and withdraw yourself against the <strong>{demo.target}</strong>{" "}
        bank to see normal, legitimate behaviour.
      </p>
      <div className="field-row">
        <label>
          Amount (ETH)
          <input
            type="number"
            min="0"
            step="0.5"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>
        <div className="btn-row">
          <button
            className="btn"
            disabled={!deployed || demo.busy === "deposit"}
            onClick={() => demo.deposit(amount)}
          >
            {demo.busy === "deposit" ? "…" : "Deposit"}
          </button>
          <button
            className="btn"
            disabled={!deployed || demo.busy === "withdraw"}
            onClick={demo.withdraw}
          >
            {demo.busy === "withdraw" ? "…" : "Withdraw"}
          </button>
        </div>
      </div>
    </div>
  );
}
