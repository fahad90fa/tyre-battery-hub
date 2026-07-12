import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { PartyManager } from "@/components/admin/PartyManager";

export const Route = createFileRoute("/_authenticated/admin/clients")({
  component: () => (
    <AdminShell title="Clients">
      <PartyManager kind="clients" title="Clients" />
    </AdminShell>
  ),
});
