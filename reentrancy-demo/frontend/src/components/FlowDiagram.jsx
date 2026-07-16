import { TARGET } from "../constants.js";

/**
 * A static-but-reactive diagram of the reentrancy loop. The "loop" edge is
 * highlighted green (blocked) or red (open) depending on the selected target.
 */
export default function FlowDiagram({ demo }) {
  const isVuln = demo.target === TARGET.VULNERABLE;
  return (
    <div className="card">
      <div className="card-head">
        <h2>How the attack flows</h2>
      </div>

      <div className="flow">
        <div className="flow-node atk">Attacker.attack()</div>
        <div className="flow-arrow">→ deposit + withdraw →</div>
        <div className="flow-node bank">Bank.withdraw()</div>
        <div className="flow-arrow">→ sends ETH →</div>
        <div className="flow-node atk">Attacker.receive()</div>
      </div>

      <div className={`flow-loop ${isVuln ? "open" : "blocked"}`}>
        <span className="loop-label">
          {isVuln ? "↩ re-enters withdraw() before balance is zeroed" : "⛔ re-entry reverts (guard + CEI)"}
        </span>
      </div>

      <ol className="flow-steps">
        <li>
          <strong>deposit()</strong> — the attacker parks a small seed so it has a balance to
          withdraw.
        </li>
        <li>
          <strong>withdraw()</strong> — the bank sends Ether{" "}
          <em>before</em> zeroing the attacker's balance.
        </li>
        <li>
          <strong>receive()</strong> — the incoming Ether triggers the attacker's fallback,
          which immediately calls <strong>withdraw()</strong> again.
        </li>
        <li>
          {isVuln ? (
            <>
              The vulnerable bank still shows the old balance, so it pays out{" "}
              <em>again and again</em> until it's empty.
            </>
          ) : (
            <>
              The secure bank has already set the balance to zero and locked the mutex, so the
              re-entrant call reverts and the whole transaction unwinds.
            </>
          )}
        </li>
      </ol>
    </div>
  );
}
