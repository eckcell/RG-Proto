"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./editor.module.css";
import { GuidedRateEditor } from "./GuidedRateEditor";

interface Product {
  id: string;
  insurerId: string;
  name: string;
  productCode: string;
  configuration: string;
  active: boolean;
  insurer: {
    name: string;
  };
}

interface Props {
  product: Product;
}

export function ProductEditor({ product }: Props) {
  const [activeTab, setActiveTab] = useState<"guided" | "json" | "diff">("guided");
  const [config, setConfig] = useState(product.configuration);
  const [originalConfig] = useState(product.configuration);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Pretty print initial JSON
  useEffect(() => {
    try {
      const parsed = JSON.parse(product.configuration);
      setConfig(JSON.stringify(parsed, null, 2));
    } catch (e) {
      // Keep as is if invalid
    }
  }, [product.configuration]);

  const handleSave = async (newConfig?: string) => {
    const configToSave = newConfig || config;
    try {
      setError(null);
      setIsSaving(true);

      // Validate JSON
      let parsedConfig;
      try {
        parsedConfig = JSON.parse(configToSave);
      } catch (e) {
        throw new Error("Invalid JSON format. Please check for syntax errors.");
      }

      // Basic structure validation (can be more strict)
      if (!parsedConfig.tiers || !Array.isArray(parsedConfig.tiers)) {
        throw new Error("Configuration must include a 'tiers' array.");
      }

      const response = await fetch(`/api/admin/products/item/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configuration: JSON.stringify(parsedConfig) }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save product.");
      }

      if (newConfig) setConfig(JSON.stringify(parsedConfig, null, 2));
      alert("Product configuration saved successfully!");
      router.refresh();
      setActiveTab("guided");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.editorContainer}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <button 
            className={`${styles.tabBtn} ${activeTab === "guided" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("guided")}
          >
            Guided Editor
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === "json" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("json")}
          >
            Raw JSON
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === "diff" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("diff")}
          >
            Compare Changes
          </button>
        </div>
        <div className={styles.toolbarRight}>
          {activeTab !== "guided" && (
            <button
              className={styles.saveBtn}
              onClick={() => handleSave()}
              disabled={isSaving || config === originalConfig}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          )}
        </div>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      <div className={styles.workspace}>
        {activeTab === "guided" && (
          <GuidedRateEditor 
            initialConfig={config} 
            onSave={handleSave} 
            isSaving={isSaving} 
          />
        )}
        
        {activeTab === "json" && (
          <textarea
            className={styles.jsonTextarea}
            value={config}
            onChange={(e) => setConfig(e.target.value)}
            spellCheck={false}
          />
        )}

        {activeTab === "diff" && (
          <div className={styles.diffView}>
            <div className={styles.diffColumn}>
              <div className={styles.columnHeader}>Current Version</div>
              <pre className={styles.diffPre}>
                {JSON.stringify(JSON.parse(originalConfig), null, 2)}
              </pre>
            </div>
            <div className={styles.diffColumn}>
              <div className={styles.columnHeader}>Proposed Changes</div>
              <pre className={styles.diffPre}>
                {(() => {
                  try {
                    return JSON.stringify(JSON.parse(config), null, 2);
                  } catch (e) {
                    return "INVALID JSON";
                  }
                })()}
              </pre>
            </div>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <p>Tip: Use a JSON formatter if the text gets messy. Ensure &apos;tiers&apos; and &apos;topUpRates&apos; keys are preserved.</p>
      </div>
    </div>
  );
}
