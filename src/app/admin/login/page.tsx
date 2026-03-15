import LoginForm from "./LoginForm";
import styles from "./page.module.css";

export const metadata = {
  title: "Admin Login | RiskGuard Compare",
};

export default function AdminLoginPage() {
  return (
    <main className={styles.main}>
      <LoginForm />
    </main>
  );
}
