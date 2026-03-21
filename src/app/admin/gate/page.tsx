import GateForm from "./GateForm";
import styles from "./gate.module.css";

export const metadata = {
  title: "Testing Access | RiskGuard Compare",
};

export default function AdminGatePage() {
  return (
    <main className={styles.main}>
      <GateForm />
    </main>
  );
}
