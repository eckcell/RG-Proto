"use client";

import { useState, useEffect } from "react";
import styles from "./upload.module.css";

interface Insurer {
  id: string;
  name: string;
}

interface DryRunResult {
  leadId: string;
  company: string;
  success: boolean;
  premium: number | null;
  error?: string;
}

interface DryRunResponse {
  success: boolean;
  message?: string;
  results?: DryRunResult[];
  error?: string;
}

export default function ProductUpload() {
  const [insurers, setInsurers] = useState<Insurer[]>([]);
  const [selectedInsurer, setSelectedInsurer] = useState("");
  const [productName, setProductName] = useState("");
  const [productCode, setProductCode] = useState("");
  const [jsonConfig, setJsonConfig] = useState("");
  const [dryRunResults, setDryRunResults] = useState<DryRunResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    fetch("/api/admin/insurers")
      .then(res => res.json())
      .then(data => setInsurers(data));
  }, []);

  const handleDryRun = async () => {
    if (!jsonConfig) return alert("Please paste JSON configuration first");
    
    setSimulating(true);
    setDryRunResults(null);
    
    try {
      const res = await fetch("/api/admin/products/dry-run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          configuration: JSON.parse(jsonConfig),
          insurerName: insurers.find(i => i.id === selectedInsurer)?.name || "Test Insurer"
        }),
      });
      const data = (await res.json()) as DryRunResponse;
      setDryRunResults(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Simulation failed";
      alert("Simulation failed: " + message);
    } finally {
      setSimulating(false);
    }
  };

  const handleSave = async () => {
    if (!selectedInsurer || !productName || !jsonConfig) {
      return alert("Please fill all required fields");
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products/insurer/${selectedInsurer}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: productName,
          productCode: productCode,
          configuration: jsonConfig,
          active: true
        }),
      });
      
      if (res.ok) {
        alert("Product uploaded successfully!");
        setDryRunResults(null);
        setJsonConfig("");
        setProductName("");
      } else {
        const data = await res.json();
        alert("Error: " + data.error);
      }
    } catch (err) {
      alert("Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.editorSection}>
        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label>Insurer</label>
            <select value={selectedInsurer} onChange={(e) => setSelectedInsurer(e.target.value)}>
              <option value="">Select Insurer...</option>
              {insurers.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </div>
          
          <div className={styles.field}>
            <label>Product Name</label>
            <input 
              type="text" 
              placeholder="e.g. CafeCare Business Plus" 
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label>Product Code</label>
            <input 
              type="text" 
              placeholder="e.g. JAN2024-V1" 
              value={productCode}
              onChange={(e) => setProductCode(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.jsonField}>
          <label>JSON Configuration (Rate Table)</label>
          <textarea 
            rows={20} 
            placeholder='{ "insurerId": "...", "productName": "...", "tiers": [...] }'
            value={jsonConfig}
            onChange={(e) => setJsonConfig(e.target.value)}
          />
        </div>

        <div className={styles.actions}>
          <button 
            onClick={handleDryRun} 
            disabled={simulating}
            className={styles.dryRunBtn}
          >
            {simulating ? "Simulating..." : "Run Dry Run (Simulation)"}
          </button>
          
          <button 
            onClick={handleSave} 
            disabled={loading || !!(dryRunResults && !dryRunResults.success)}
            className={styles.saveBtn}
          >
            {loading ? "Saving..." : "Commit to Production"}
          </button>
        </div>
      </div>

      {dryRunResults && (
        <div className={`${styles.results} ${dryRunResults.success ? styles.resultsSuccess : styles.resultsError}`}>
          <h3>Dry Run Results</h3>
          <p className={styles.summary}>{dryRunResults.success ? "✅ No regressions found." : "❌ Simulation detected issues."}</p>
          
          <div className={styles.leadResults}>
            {dryRunResults.results?.map((r) => {
              const statusClass = r.success ? styles.successText : styles.errorText;
              return (
                <div key={r.leadId} className={styles.leadRow}>
                  <span>{r.company}</span>
                  <span className={statusClass}>
                    {r.success ? `Success ($${r.premium ? (r.premium/100).toFixed(2) : "0.00"})` : `Error: ${r.error}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
