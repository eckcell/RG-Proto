import InsurerManager from "./InsurerManager";

export const metadata = {
  title: "Insurer Management | RiskGuard Admin",
};

export default function AdminInsurersPage() {
  return (
    <div>
      <div style={{ marginBottom: "var(--space-8)" }}>
        <h1>Insurer Management</h1>
        <p>Enable/disable insurers and manage their brand identity.</p>
      </div>

      <InsurerManager />
    </div>
  );
}
