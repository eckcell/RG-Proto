"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./products.module.css";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  insurerId: string;
  name: string;
  productCode: string;
  active: boolean;
  updatedAt: string;
  insurer: {
    name: string;
    logoPath: string;
  };
}

interface Props {
  products: Product[];
}

export function ProductsTable({ products: initialProducts }: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [isToggling, setIsToggling] = useState<string | null>(null);
  const router = useRouter();

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.insurer.name.toLowerCase().includes(search.toLowerCase()) ||
      p.productCode.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleActive = async (productId: string, currentStatus: boolean) => {
    if (isToggling) return;
    
    try {
      setIsToggling(productId);
      const response = await fetch(`/api/admin/products/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, active: !currentStatus }),
      });

      if (response.ok) {
        setProducts(prev => 
          prev.map(p => p.id === productId ? { ...p, active: !currentStatus } : p)
        );
        router.refresh();
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      console.error("Toggle error:", error);
      alert("An error occurred");
    } finally {
      setIsToggling(null);
    }
  };

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.tableHeader}>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Search products, insurers, or codes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Insurer & Product</th>
              <th>Code</th>
              <th>Status</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td>
                  <div className={styles.insurerCell}>
                    <Image
                      src={product.insurer.logoPath}
                      alt={product.insurer.name}
                      width={32}
                      height={32}
                      className={styles.insurerLogo}
                    />
                    <div>
                      <span className={styles.productName}>{product.name}</span>
                      <span className={styles.insurerName}>{product.insurer.name}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={styles.productCode}>{product.productCode}</span>
                </td>
                <td>
                  <div className={styles.statusCell}>
                    <span className={`${styles.statusBadge} ${product.active ? styles.statusActive : styles.statusInactive}`}>
                      {product.active ? "Active" : "Inactive"}
                    </span>
                    <button 
                      onClick={() => handleToggleActive(product.id, product.active)}
                      className={styles.toggleBtn}
                      disabled={isToggling === product.id}
                    >
                      {isToggling === product.id ? "..." : (product.active ? "Deactivate" : "Activate")}
                    </button>
                  </div>
                </td>
                <td className={styles.dateCell}>
                  {new Date(product.updatedAt).toLocaleDateString("en-SG", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td>
                  <Link href={`/admin/products/${product.id}/edit`} className={styles.editBtn}>
                    Edit Rules & Rates
                  </Link>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  No products found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
