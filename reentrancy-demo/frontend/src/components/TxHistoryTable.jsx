export default function TxHistoryTable({ demo }) {
  const { txHistory } = demo;
  return (
    <div className="card">
      <div className="card-head">
        <h2>Transaction history</h2>
        <span className="chip muted">{txHistory.length}</span>
      </div>
      {txHistory.length === 0 ? (
        <p className="empty">No transactions yet.</p>
      ) : (
        <div className="table-wrap">
          <table className="tx-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Action</th>
                <th>Detail</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {txHistory.map((t) => (
                <tr key={t.id}>
                  <td className="mono muted">{t.time}</td>
                  <td>{t.action}</td>
                  <td className="mono detail">{t.detail}</td>
                  <td>
                    <span className={`chip ${t.status === "ok" ? "ok" : "danger"}`}>
                      {t.status === "ok" ? "success" : "revert"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
