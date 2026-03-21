import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProductEditor } from "./ProductEditor";
import styles from "../../products.module.css";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      insurer: true,
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <div className={styles.breadcrumb}>
            <Link href="/admin/products">Products</Link> / {product.name}
          </div>
          <h1>Edit Rules & Rates</h1>
          <p className={styles.subtitle}>
            Updating configuration for <strong>{product.insurer.name}</strong> - <strong>{product.name}</strong>
          </p>
        </div>
      </header>

      <section className={styles.section}>
        <ProductEditor product={JSON.parse(JSON.stringify(product))} />
      </section>
    </div>
  );
}
