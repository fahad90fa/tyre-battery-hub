import { Wrench } from "lucide-react";
import { useCompany } from "@/lib/company";
import { shortDate } from "@/lib/format";

/**
 * Official company letterhead used at the top of printable documents
 * (invoices, quotations). Renders on screen and in print.
 */
export function Letterhead({ docTitle, docNo, date, extra }: {
  docTitle: string;
  docNo: string;
  date: string | Date | null | undefined;
  extra?: React.ReactNode;
}) {
  const COMPANY = useCompany();
  return (
    <div className="border-b-2 border-foreground/80 pb-3 mb-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gold/15 grid place-items-center text-gold border border-gold/40">
            <Wrench className="h-6 w-6" />
          </div>
          <div className="leading-tight">
            <div className="text-xl font-black tracking-tight">
              {COMPANY.name.split(" ")[0]} <span className="text-gold">{COMPANY.name.split(" ").slice(1).join(" ")}</span>
            </div>
            {COMPANY.fullName !== COMPANY.name && <div className="text-xs font-medium">{COMPANY.fullName}</div>}
            <div className="text-[10px] text-muted-foreground">{COMPANY.tagline}</div>
          </div>
        </div>
        <div className="text-right text-[11px] text-muted-foreground leading-relaxed shrink-0">
          <div>{COMPANY.address}</div>
          {COMPANY.branch && <div>{COMPANY.branch} branch</div>}
          <div>{COMPANY.phone}</div>
          <div>{COMPANY.email}</div>
        </div>
      </div>
      {/* Payment accounts, so a customer can pay by transfer straight off the slip. */}
      {(COMPANY.jazzcashNumber || COMPANY.bankAccountNumber) && (
        <div className="mt-2 text-[11px] flex flex-wrap gap-x-4 gap-y-0.5">
          {COMPANY.jazzcashNumber && (
            <span><b>JazzCash</b> <span className="font-mono">{COMPANY.jazzcashNumber}</span>{COMPANY.jazzcashTitle ? ` (${COMPANY.jazzcashTitle})` : ""}</span>
          )}
          {COMPANY.bankAccountNumber && (
            <span><b>{COMPANY.bankName || "Bank"}</b> <span className="font-mono">{COMPANY.bankAccountNumber}</span>{COMPANY.bankAccountTitle ? ` (${COMPANY.bankAccountTitle})` : ""}</span>
          )}
        </div>
      )}
      <div className="mt-3 flex items-center justify-between">
        <div className="text-sm font-bold uppercase tracking-[0.2em]">{docTitle}</div>
        <div className="text-right text-xs">
          <div className="font-mono font-semibold">{docNo}</div>
          <div className="text-muted-foreground">{shortDate(date)}</div>
          {extra}
        </div>
      </div>
    </div>
  );
}
