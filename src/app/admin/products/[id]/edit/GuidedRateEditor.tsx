"use client";

import { useState, useEffect } from "react";
import styles from "./editor.module.css";
import type { InsurerPackage, PackageTier } from "@/engine/types";

interface Props {
  initialConfig: string;
  onSave: (config: string) => Promise<void>;
  isSaving: boolean;
}

export function GuidedRateEditor({ initialConfig, onSave, isSaving }: Props) {
  const [data, setData] = useState<InsurerPackage>(() => {
    try {
      return JSON.parse(initialConfig);
    } catch (e) {
      return {
        insurerId: "",
        productName: "",
        tiers: [],
        topUpRates: {},
        optionalCovers: [],
        specialFeatures: [],
        keyExclusions: []
      };
    }
  });

  const [activeSection, setActiveSection] = useState<string>("tiers");

  // Sync back to parent when data changes (handled by Save button)
  const handleSave = () => {
    onSave(JSON.stringify(data, null, 2));
  };

  const updateTier = (index: number, field: keyof PackageTier, value: any) => {
    const newTiers = [...data.tiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    setData({ ...data, tiers: newTiers });
  };

  const addTier = () => {
    const newTier: PackageTier = {
      id: `tier_${Date.now()}`,
      name: "New Plan",
      description: "",
      basePremiumCents: 0,
      baseCoverage: {}
    };
    setData({ ...data, tiers: [...data.tiers, newTier] });
  };

  const removeTier = (index: number) => {
    const newTiers = data.tiers.filter((_, i) => i !== index);
    setData({ ...data, tiers: newTiers });
  };

  return (
    <div className={styles.guidedEditor}>
      <div className={styles.sidebar}>
        <button 
          className={`${styles.sideNavBtn} ${activeSection === "basics" ? styles.active : ""}`}
          onClick={() => setActiveSection("basics")}
        >
          Product Basics
        </button>
        <button 
          className={`${styles.sideNavBtn} ${activeSection === "tiers" ? styles.active : ""}`}
          onClick={() => setActiveSection("tiers")}
        >
          Tiers & Plans
        </button>
        <button 
          className={`${styles.sideNavBtn} ${activeSection === "topups" ? styles.active : ""}`}
          onClick={() => setActiveSection("topups")}
        >
          Top-Up Rates
        </button>
        <button 
          className={`${styles.sideNavBtn} ${activeSection === "features" ? styles.active : ""}`}
          onClick={() => setActiveSection("features")}
        >
          Features & Exclusions
        </button>
        
        <div className={styles.sidebarFooter}>
            <button 
                className={styles.saveBtn} 
                onClick={handleSave}
                disabled={isSaving}
            >
                {isSaving ? "Saving..." : "Save Changes"}
            </button>
        </div>
      </div>

      <div className={styles.content}>
        {activeSection === "basics" && (
          <div className={styles.section}>
            <h3>Product Basics</h3>
            <div className={styles.formGroup}>
              <label>Product Display Name</label>
              <input 
                type="text" 
                value={data.productName} 
                onChange={(e) => setData({ ...data, productName: e.target.value })} 
              />
            </div>
          </div>
        )}

        {activeSection === "tiers" && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3>Insurance Tiers</h3>
              <button className={styles.secondaryBtn} onClick={addTier}>+ Add Tier</button>
            </div>
            
            {data.tiers.map((tier, idx) => (
              <div key={tier.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <input 
                    type="text" 
                    value={tier.name} 
                    onChange={(e) => updateTier(idx, "name", e.target.value)}
                    className={styles.cardTitleInput}
                  />
                  <button className={styles.deleteBtn} onClick={() => removeTier(idx)}>×</button>
                </div>
                <div className={styles.cardGrid}>
                  <div className={styles.formGroup}>
                    <label>Base Premium (Cents)</label>
                    <input 
                      type="number" 
                      value={tier.basePremiumCents || 0} 
                      onChange={(e) => updateTier(idx, "basePremiumCents", parseInt(e.target.value))} 
                    />
                    <small>S${((tier.basePremiumCents || 0) / 100).toFixed(2)}</small>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Short Description</label>
                    <input 
                      type="text" 
                      value={tier.description} 
                      onChange={(e) => updateTier(idx, "description", e.target.value)} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSection === "topups" && (
          <div className={styles.section}>
            <h3>Top-Up Rates</h3>
            <p className={styles.hint}>Configure how additional coverage increases the premium.</p>
            <div className={styles.card}>
                <h4>Work Injury Compensation (WICA)</h4>
                <div className={styles.formGroup}>
                    <label>Rate per additional employee (Cents)</label>
                    <input 
                        type="number"
                        value={(data.topUpRates as any)?.wica?.perEmployeeCents?.fnb || 0}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setData({
                                ...data,
                                topUpRates: {
                                    ...data.topUpRates,
                                    wica: { perEmployeeCents: { fnb: val } }
                                }
                            } as any);
                        }}
                    />
                </div>
            </div>
          </div>
        )}

        {activeSection === "features" && (
          <div className={styles.section}>
            <h3>Special Features</h3>
            <textarea 
                placeholder="One feature per line..."
                value={data.specialFeatures?.join("\n")}
                onChange={(e) => setData({ ...data, specialFeatures: e.target.value.split("\n").filter(m => m) })}
            />
            
            <h3>Key Exclusions</h3>
            <textarea 
                placeholder="One exclusion per line..."
                value={data.keyExclusions?.join("\n")}
                onChange={(e) => setData({ ...data, keyExclusions: e.target.value.split("\n").filter(m => m) })}
            />
          </div>
        )}
      </div>
    </div>
  );
}
