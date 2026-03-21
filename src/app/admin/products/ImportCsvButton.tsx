"use client";

import styles from "./products.module.css";

export function ImportCsvButton() {
  return (
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
  );
}
