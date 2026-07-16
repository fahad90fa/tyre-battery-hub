export default function TransactionLog({ demo }) {
  const { logs } = demo;
  return (
    <div className="card">
      <div className="card-head">
        <h2>Event log</h2>
        <span className="chip muted">{logs.length}</span>
      </div>
      <div className="log">
        {logs.length === 0 ? (
          <p className="empty">Actions you take will stream here.</p>
        ) : (
          logs.map((l) => (
            <div className={`log-line ${l.kind}`} key={l.id}>
              <span className="log-time">{l.time}</span>
              <span className="log-text">{l.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
