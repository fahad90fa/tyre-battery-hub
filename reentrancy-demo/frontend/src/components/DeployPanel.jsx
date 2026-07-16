import { useState } from "react";
import { DEFAULT_VICTIM_DEPOSIT } from "../constants.js";

const shortAddr = (a) => (a ? `${a.slice(0, 8)}…${a.slice(-6)}` : "not deployed");

export default function DeployPanel({ demo }) {
  const [seed, setSeed] = useState(DEFAULT_VICTIM_DEPOSIT);
  const deployed = Boolean(demo.addresses.vulnerable);

  return (
    <div className="card">
      <div className="card-head">
        <h2>1 · Deploy &amp; seed</h2>
        {deployed && <span className="chip ok">deployed</span>}
      </div>

      <div className="btn-row">
        <button
          className="btn primary"
          disabled={demo.busy === "deploy"}
          onClick={demo.deployBanks}
        >
          {demo.busy === "deploy" ? "Deploying…" : deployed ? "Redeploy contracts" : "Deploy contracts"}
        </button>
        <button className="btn ghost" disabled={demo.busy != null} onClick={demo.reset}>
          Reset
        </button>
      </div>

      {deployed && (
        <ul className="addr-list">
          <li>
            <span className="tag vuln">VulnerableBank</span>
            <code>{shortAddr(demo.addresses.vulnerable)}</code>
          </li>
          <li>
            <span className="tag safe">SecureBank</span>
            <code>{shortAddr(demo.addresses.secure)}</code>
          </li>
          <li>
            <span className="tag atk">Attacker</span>
            <code>{shortAddr(demo.addresses.attacker)}</code>
          </li>
        </ul>
      )}

      <div className="field-row">
        <label>
          Victim deposit (ETH each)
          <input
            type="number"
            min="0"
            step="0.5"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
          />
        </label>
        <button
          className="btn"
          disabled={!deployed || demo.busy === "seed"}
          onClick={() => demo.seedVictims(seed)}
        >
          {demo.busy === "seed" ? "Seeding…" : "Seed 2 victims"}
        </button>
      </div>
      <p className="hint">
        Seeding makes two innocent accounts deposit into <em>both</em> banks, giving the
        attack something real to steal.
      </p>
    </div>
  );
}
