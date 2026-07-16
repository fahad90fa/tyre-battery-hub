const eth = (v) => `${Number(v).toFixed(4)} ETH`;
const shortAddr = (a) => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "—");

function Bar({ value, max, className }) {
  const pct = max > 0 ? Math.min(100, (Number(value) / max) * 100) : 0;
  return (
    <div className="bar-track">
      <div className={`bar-fill ${className}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function BalancesPanel({ demo }) {
  const { balances } = demo;
  const vals = [
    Number(balances.vulnerable),
    Number(balances.secure),
    Number(balances.attacker),
  ];
  const max = Math.max(1, ...vals);

  return (
    <div className="card">
      <div className="card-head">
        <h2>Live balances</h2>
        <button className="btn tiny" onClick={demo.refreshBalances}>
          refresh
        </button>
      </div>

      <div className="balance-row">
        <div className="balance-label">
          <span className="tag vuln">VulnerableBank</span>
        </div>
        <Bar value={balances.vulnerable} max={max} className="vuln" />
        <span className="balance-val">{eth(balances.vulnerable)}</span>
      </div>

      <div className="balance-row">
        <div className="balance-label">
          <span className="tag safe">SecureBank</span>
        </div>
        <Bar value={balances.secure} max={max} className="safe" />
        <span className="balance-val">{eth(balances.secure)}</span>
      </div>

      <div className="balance-row">
        <div className="balance-label">
          <span className="tag atk">Attacker</span>
        </div>
        <Bar value={balances.attacker} max={max} className="atk" />
        <span className="balance-val">{eth(balances.attacker)}</span>
      </div>

      <div className="victims">
        <h3>Accounts</h3>
        <div className="mini-row">
          <span>Your wallet</span>
          <code>{shortAddr(demo.account)}</code>
          <span className="balance-val">{eth(balances.account)}</span>
        </div>
        {balances.victims.map((v, i) => (
          <div className="mini-row" key={v.address}>
            <span>Victim #{i + 1}</span>
            <code>{shortAddr(v.address)}</code>
            <span className="balance-val">{eth(v.balance)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
