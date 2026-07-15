import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { PartyManager } from "@/components/admin/PartyManager";

export const Route = createFileRoute("/_authenticated/admin/clients")({
  component: () => (
    <AdminShell title="Customer Accounts (Udhar)">
      <PartyManager kind="clients" title="Customers" />
    </AdminShell>
  ),
});
