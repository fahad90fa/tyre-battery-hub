import { useEffect, useState } from "react";

function useCountdown(target: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, target - now);
  const s = Math.floor(diff / 1000);
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

export function Deals() {
  const target = Date.now() + 82 * 86400_000 + 7 * 3600_000 + 40 * 60_000;
  const { d, h, m, s } = useCountdown(target);

  return (
    <section className="px-4 mt-10">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <h2 className="text-2xl font-bold">
          Day Of The <span className="text-primary">Deals</span>
        </h2>
        <div className="flex items-center gap-2 rounded-full bg-card shadow-sm px-4 py-2 text-sm">
          <Pill label="Days" v={d} />
          <span>:</span>
          <Pill v={h} />
          <span>:</span>
          <Pill v={m} />
          <span>:</span>
          <Pill v={s} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="rounded-2xl bg-card shadow-sm p-8 text-center text-sm text-muted-foreground">
            No deals available.
          </div>
        ))}
      </div>
    </section>
  );
}

function Pill({ v, label }: { v: number; label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 font-semibold">
      <span className="text-gold">{String(v).padStart(2, "0")}</span>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </span>
  );
}
