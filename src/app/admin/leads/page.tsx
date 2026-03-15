import LeadsTable from "./LeadsTable";

export const metadata = {
  title: "Lead Management | RiskGuard Admin",
};

export default function AdminLeadsPage() {
  return (
    <div>
      <div style={{ marginBottom: "var(--space-8)" }}>
        <h1>Lead Management</h1>
        <p>View and manage all incoming insurance interest.</p>
      </div>

      <LeadsTable />
    </div>
  );
}
