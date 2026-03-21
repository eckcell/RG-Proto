import { prisma } from "@/lib/prisma";
import { ProductsTable } from "./ProductsTable";
import { ImportCsvButton } from "./ImportCsvButton";
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
          <ImportCsvButton />
        </div>
      </header>

      <section className={styles.section}>
        <ProductsTable products={JSON.parse(JSON.stringify(products))} />
      </section>
    </div>
  );
}
