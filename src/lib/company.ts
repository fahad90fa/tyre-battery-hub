import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Company details printed on letterhead documents (invoices, quotations)
// and used across the site. These are the built-in defaults; the owner can
// change every one of them in Admin → Business Settings (stored in the
// app_settings table), and useCompany() returns the live values.
export const COMPANY = {
  // Logo lockup: "MT&B" over "House Auto Hub"; the full legal name goes
  // underneath it on documents.
  name: "MT&B House Auto Hub",
  fullName: "Muzaffar Tyres & Batteries House Auto Hub",
  tagline: "Tyres · Batteries · Engine Oil · Rims · Car Accessories",
  address: "Near Degree Boys College, Multan Road, Muzaffargarh",
  branch: "Muzaffargarh",
  phone: "0304-0510256",
  email: "muzaffartyresandbatteries@gmail.com",
  website: "mtbhouse.store",
  // Bank transfer details printed on every slip once filled in.
  bankName: "",
  bankAccountTitle: "",
  bankAccountNumber: "",
  bankIban: "",
};
export type Company = typeof COMPANY;

/** Field → app_settings key. */
export const COMPANY_KEYS: Record<keyof Company, string> = {
  name: "name", fullName: "full_name", tagline: "tagline", address: "address", branch: "branch",
  phone: "phone", email: "email", website: "website",
  bankName: "bank_name", bankAccountTitle: "bank_account_title",
  bankAccountNumber: "bank_account_number", bankIban: "bank_iban",
};

let current: Company = { ...COMPANY };
let pending: Promise<Company> | null = null;
const listeners = new Set<(c: Company) => void>();

/** Load the owner's saved details once (shared by every component). */
export function loadCompany(force = false): Promise<Company> {
  if (pending && !force) return pending;
  pending = (async () => {
    const { data } = await supabase.from("app_settings").select("key, value");
    if (data && data.length > 0) {
      const next: Company = { ...COMPANY };
      (Object.keys(COMPANY_KEYS) as (keyof Company)[]).forEach((field) => {
        const row = data.find((r) => r.key === COMPANY_KEYS[field]);
        // A blank saved value falls back to the built-in default.
        if (row && row.value.trim() !== "") next[field] = row.value.trim();
        // Bank fields are blank by default and only shown when set.
        if (row && field.startsWith("bank")) next[field] = row.value.trim();
      });
      current = next;
      listeners.forEach((l) => l(current));
    }
    return current;
  })();
  return pending;
}

/** Live company details: defaults first, then whatever the owner saved. */
export function useCompany(): Company {
  const [c, setC] = useState<Company>(current);
  useEffect(() => {
    listeners.add(setC);
    loadCompany().then(setC);
    return () => { listeners.delete(setC); };
  }, []);
  return c;
}

/** Save edited details (Admin → Business Settings) and refresh everywhere. */
export async function saveCompany(values: Partial<Company>): Promise<{ error: string | null }> {
  const rows = (Object.keys(values) as (keyof Company)[]).map((field) => ({
    key: COMPANY_KEYS[field], value: (values[field] ?? "").trim(), updated_at: new Date().toISOString(),
  }));
  const { error } = await supabase.from("app_settings").upsert(rows, { onConflict: "key" });
  if (error) return { error: error.message };
  await loadCompany(true);
  return { error: null };
}
