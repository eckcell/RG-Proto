import { prisma } from "@/lib/prisma";
import { ProductsTable } from "./ProductsTable";
import styles from "./products.module.css";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      insurer: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Products & Rates</h1>
          <p className={styles.subtitle}>
            Manage insurance products, base premiums, and JSON configurations.
          </p>
        </div>
        <div className={styles.actions}>
          <a href="/api/admin/products/export" className={styles.buttonSecondary}>
            Export CSV
          </a>
          <label className={`${styles.button} cursor-pointer`}>
            Import CSV
            <input 
              type="file" 
              accept=".csv" 
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                
                const formData = new FormData();
                formData.append("file", file);
                
                const res = await fetch("/api/admin/products/import", {
                  method: "POST",
                  body: formData
                });
                
                const result = await res.json();
                if (result.success) {
                  alert(result.message);
                  window.location.reload();
                } else {
                  alert(result.error || "Import failed");
                }
              }}
              className="hidden" 
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </header>

      <section className={styles.section}>
        <ProductsTable products={JSON.parse(JSON.stringify(products))} />
      </section>
    </div>
  );
}
