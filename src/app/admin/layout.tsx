import AuthProvider from "@/components/providers/AuthProvider";
import Link from "next/link";
import styles from "./admin-layout.module.css";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Authentication bypass enabled for testing
  /*
  if (!session) {
    redirect("/admin/login");
  }
  */

  return (
    <AuthProvider>
      <div className={styles.adminWrapper}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.logo}>🛡️</div>
            <span className={styles.brandName}>Admin Panel</span>
          </div>
          
          <nav className={styles.nav}>
            <Link href="/admin/dashboard" className={styles.navItem}>
              Dashboard
            </Link>
            <Link href="/admin/leads" className={styles.navItem}>
              Leads
            </Link>
            <Link href="/admin/insurers" className={styles.navItem}>
              Insurers
            </Link>
            <Link href="/admin/products/upload" className={styles.navItem}>
              Update Rates
            </Link>
          </nav>

          <div className={styles.sidebarFooter}>
            <div className={styles.userProfile}>
              <div className={styles.avatar}>A</div>
              <div className={styles.userInfo}>
                <p className={styles.userName}>{session?.user?.name || "Admin"}</p>
                <p className={styles.userRole}>Broker</p>
              </div>
            </div>
          </div>
        </aside>

        <main className={styles.mainContent}>
          <header className={styles.header}>
            <div className={styles.breadcrumb}>
              Dashboard
            </div>
            <div className={styles.headerActions}>
              <Link href="/api/auth/signout" className={styles.logoutBtn}>
                Logout
              </Link>
            </div>
          </header>
          
          <div className={styles.pageContent}>
            {children}
          </div>
        </main>
      </div>
    </AuthProvider>
  );
}
