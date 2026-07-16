export default function StatsPanel({ demo }) {
  const { stats } = demo;
  return (
    <div className="card">
      <div className="card-head">
        <h2>Attack statistics</h2>
        {stats.lastAttack && (
          <span className={`chip ${stats.lastAttack === "success" ? "danger" : "ok"}`}>
            {stats.lastAttack === "success" ? "drained" : "blocked"}
          </span>
        )}
      </div>
      <div className="stat-grid">
        <div className="stat">
          <span className="stat-num">{stats.reentryCount}</span>
          <span className="stat-label">recursive re-entries</span>
        </div>
        <div className="stat">
          <span className="stat-num">{Number(stats.drained).toFixed(2)}</span>
          <span className="stat-label">ETH drained from bank</span>
        </div>
        <div className="stat">
          <span className="stat-num">{Number(stats.stolen).toFixed(2)}</span>
          <span className="stat-label">ETH held by attacker</span>
        </div>
      </div>
    </div>
  );
}
