import { prisma } from "@/lib/prisma";
import { autoArchiveLeads } from "@/lib/admin-utils";
import styles from "./dashboard.module.css";

export const metadata = {
  title: "Dashboard Overview | RiskGuard Admin",
};

export default async function AdminDashboardPage() {
  // Trigger maintenance task on dashboard load
  const archivedCount = await autoArchiveLeads();
  if (archivedCount > 0) {
    console.log(`Auto-archived ${archivedCount} inactive leads.`);
  }

  const [totalLeads, todayLeads, totalInsurers] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.insurer.count({ where: { active: true } }),
  ]);

  return (
    <div className={styles.dashboard}>
      <div className={styles.welcome}>
        <h1>Dashboard Overview</h1>
        <p>Analyze performance and manage active leads.</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Total Leads</p>
          <p className={styles.statValue}>{totalLeads}</p>
          <div className={`${styles.badge} ${styles.badgeGreen}`}>+12% vs last month</div>
        </div>

        <div className={styles.statCard}>
          <p className={styles.statLabel}>Leads Today</p>
          <p className={styles.statValue}>{todayLeads}</p>
          <div className={styles.badge}>Real-time updates</div>
        </div>

        <div className={styles.statCard}>
          <p className={styles.statLabel}>Active Insurers</p>
          <p className={styles.statValue}>{totalInsurers}</p>
          <div className={styles.badge}>Participating partners</div>
        </div>
      </div>

      <div className={styles.recentActivity}>
        <div className={styles.sectionHeader}>
          <h2>Recent Leads</h2>
          <button className={styles.viewAllBtn}>View All</button>
        </div>
        
        <div className={styles.activityCard}>
          <p className={styles.emptyState}>No recent activity found. New leads will appear here.</p>
        </div>
      </div>
    </div>
  );
}
