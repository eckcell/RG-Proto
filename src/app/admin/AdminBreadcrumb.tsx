"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import styles from "./admin-layout.module.css";

const labels: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/leads": "Leads",
  "/admin/insurers": "Insurers",
  "/admin/products": "Products",
  "/admin/templates": "Form Templates",
  "/admin/products/upload": "Update Rates",
};

export function AdminBreadcrumb() {
  const pathname = usePathname();
  
  if (pathname === "/admin/dashboard") {
      return <div className={styles.breadcrumb}>Dashboard</div>;
  }

  const parts = pathname.split("/").filter(Boolean);
  
  return (
    <div className={styles.breadcrumb}>
      {parts.map((part, idx) => {
        const href = "/" + parts.slice(0, idx + 1).join("/");
        const isLast = idx === parts.length - 1;
        const label = labels[href] || (part.length > 20 ? "Edit" : part.charAt(0).toUpperCase() + part.slice(1));

        return (
          <span key={href}>
            {idx > 0 && <span className={styles.separator}>/</span>}
            {isLast ? (
              <span className={styles.current}>{label}</span>
            ) : (
              <Link href={href}>{label}</Link>
            )}
          </span>
        );
      })}
    </div>
  );
}
