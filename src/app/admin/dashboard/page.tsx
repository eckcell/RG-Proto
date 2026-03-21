import { prisma } from "@/lib/prisma";
import { autoArchiveLeads } from "@/lib/admin-utils";
import styles from "./dashboard.module.css";
import Link from "next/link";

export const metadata = {
  title: "Dashboard Overview | RiskGuard Admin",
};

export default async function AdminDashboardPage() {
  // Trigger maintenance task on dashboard load
  const archivedCount = await autoArchiveLeads();
  if (archivedCount > 0) {
    console.log(`Auto-archived ${archivedCount} inactive leads.`);
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const [totalLeads, todayLeads, totalInsurers, thisMonthLeads, lastMonthLeads, recentLeads] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({
      where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    }),
    prisma.insurer.count({ where: { active: true } }),
    prisma.lead.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.lead.count({ where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } } }),
    prisma.lead.findMany({ 
      take: 5, 
      orderBy: { createdAt: "desc" }
    }),
  ]);

  const percentChange = lastMonthLeads > 0 
    ? Math.round(((thisMonthLeads - lastMonthLeads) / lastMonthLeads) * 100)
    : 0;

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
          <div className={`${styles.badge} ${percentChange >= 0 ? styles.badgeGreen : styles.badgeRed }`}>
            {percentChange >= 0 ? "+" : ""}{percentChange}% vs last month
          </div>
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
          <Link href="/admin/leads" className={styles.viewAllBtn}>View All</Link>
        </div>
        
        <div className={styles.activityCard}>
          {recentLeads.length > 0 ? (
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Company</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {recentLeads.map(lead => (
                        <tr key={lead.id}>
                            <td>{lead.companyName}</td>
                            <td>{lead.businessType}</td>
                            <td>
                                <span className={`${styles.statusBadge} ${styles[lead.status.toLowerCase()] || ''}`}>
                                    {lead.status}
                                </span>
                            </td>
                            <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
          ) : (
            <p className={styles.emptyState}>No recent activity found. New leads will appear here.</p>
          )}
        </div>
      </div>
    </div>
  );
}
