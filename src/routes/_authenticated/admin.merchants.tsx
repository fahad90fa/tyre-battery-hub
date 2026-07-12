import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { PartyManager } from "@/components/admin/PartyManager";

export const Route = createFileRoute("/_authenticated/admin/merchants")({
  component: () => (
    <AdminShell title="Merchants">
      <PartyManager kind="merchants" title="Merchants" />
    </AdminShell>
  ),
});
