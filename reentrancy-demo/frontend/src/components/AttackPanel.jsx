import { useState } from "react";
import { DEFAULT_ATTACK_SEED, TARGET } from "../constants.js";

export default function AttackPanel({ demo }) {
  const [seed, setSeed] = useState(DEFAULT_ATTACK_SEED);
  const deployed = Boolean(demo.addresses.vulnerable);
  const isVuln = demo.target === TARGET.VULNERABLE;
  const hasLoot = Number(demo.balances.attacker) > 0;

  return (
    <div className={`card attack-card ${isVuln ? "danger" : "safe"}`}>
      <div className="card-head">
        <h2>4 · Execute the attack</h2>
        <span className={`chip ${isVuln ? "danger" : "ok"}`}>
          target: {demo.target}
        </span>
      </div>

      <div className="field-row">
        <label>
          Attack seed (ETH)
          <input
            type="number"
            min="0"
            step="0.5"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
          />
        </label>
        <button
          className="btn danger big"
          disabled={!deployed || demo.busy === "attack"}
          onClick={() => demo.attack(seed)}
        >
          {demo.busy === "attack" ? "Attacking…" : "🚀 Launch reentrancy attack"}
        </button>
      </div>

      <p className="hint">
        Deploys a fresh Attacker pointed at the {demo.target} bank, deposits the seed, then
        recursively re-enters <code>withdraw()</code>.
      </p>

      {hasLoot && (
        <button className="btn" disabled={demo.busy === "collect"} onClick={demo.collect}>
          {demo.busy === "collect"
            ? "Collecting…"
            : `Collect ${Number(demo.balances.attacker).toFixed(2)} ETH loot → wallet`}
        </button>
      )}

      {demo.stats.lastAttack === "success" && (
        <div className="verdict bad">
          💀 Attack succeeded — {Number(demo.stats.drained).toFixed(2)} ETH drained.
        </div>
      )}
      {demo.stats.lastAttack === "reverted" && (
        <div className="verdict good">
          🛡️ Attack blocked — the secure bank reverted the reentrant call.
        </div>
      )}
    </div>
  );
}
