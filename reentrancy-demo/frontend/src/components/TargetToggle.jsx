import { TARGET } from "../constants.js";

export default function TargetToggle({ demo }) {
  const isVuln = demo.target === TARGET.VULNERABLE;
  return (
    <div className="card">
      <div className="card-head">
        <h2>2 · Choose the target</h2>
      </div>
      <div className={`toggle ${isVuln ? "on-vuln" : "on-safe"}`}>
        <button
          className={`toggle-half ${isVuln ? "active" : ""}`}
          onClick={() => demo.setTarget(TARGET.VULNERABLE)}
        >
          <span className="toggle-title">Vulnerable</span>
          <span className="toggle-sub">no guard · state updated late</span>
        </button>
        <button
          className={`toggle-half ${!isVuln ? "active" : ""}`}
          onClick={() => demo.setTarget(TARGET.SECURE)}
        >
          <span className="toggle-title">Secure</span>
          <span className="toggle-sub">CEI + nonReentrant guard</span>
        </button>
      </div>
      <p className="hint">
        {isVuln
          ? "The attack will succeed and drain this bank."
          : "The identical attack will revert — nothing gets stolen."}
      </p>
    </div>
  );
}
