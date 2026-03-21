import { prisma } from "@/lib/prisma";
import Link from "next/link";
import styles from "../products/products.module.css"; // Reuse product styles

export default async function TemplatesPage() {
  const templates = await prisma.formTemplate.findMany({
    include: { industry: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <div className={styles.breadcrumb}>Admin / Form Templates</div>
          <h1>Form Templates</h1>
          <p className={styles.subtitle}>Define dynamic fields and steps for the customer quotation journey.</p>
        </div>
        <Link href="/admin/templates/new" className={styles.uploadBtn}>
          + Create New Template
        </Link>
      </header>

      <section className={styles.section}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Template Name</th>
              <th>Industry</th>
              <th>Status</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((template) => (
              <tr key={template.id}>
                <td><strong>{template.name}</strong></td>
                <td>{template.industry.name}</td>
                <td>
                  <span className={`${styles.statusBadge} ${template.active ? styles.active : styles.inactive}`}>
                    {template.active ? "Active" : "Draft"}
                  </span>
                </td>
                <td>{new Date(template.updatedAt).toLocaleDateString()}</td>
                <td>
                  <Link href={`/admin/templates/${template.id}/edit`} className={styles.editLink}>
                    Edit Structure
                  </Link>
                </td>
              </tr>
            ))}
            {templates.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "3rem" }}>
                  No templates found. Create one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
