"use client";

import { useState } from "react";
import styles from "../../../products/[id]/edit/editor.module.css";
import { useRouter } from "next/navigation";

interface FormTemplate {
  id: string;
  name: string;
  config: string;
  active: boolean;
  industry: { name: string };
}

interface Props {
  template: FormTemplate;
}

export function TemplateEditor({ template }: Props) {
  const router = useRouter();
  const [config, setConfig] = useState(template.config);
  const [name, setName] = useState(template.name);
  const [active, setActive] = useState(template.active);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDiff, setShowDiff] = useState(false);

  const handleSave = async () => {
    try {
      JSON.parse(config); // Validation
    } catch (e) {
      setError("Invalid JSON format. Please check your syntax.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/templates/${template.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, config, active }),
      });

      if (!res.ok) throw new Error("Failed to save template");

      router.refresh();
      alert("Template saved successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.editorMain}>
      <div className={styles.topBar}>
        <div className={styles.formGroup}>
          <label>Template Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            className={styles.input}
          />
        </div>
        <div className={styles.actions}>
          <label className={styles.toggle}>
            <input 
              type="checkbox" 
              checked={active} 
              onChange={(e) => setActive(e.target.checked)} 
            />
            <span>{active ? "Active" : "Draft"}</span>
          </label>
          <button 
            className={styles.saveBtn} 
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? "Saving..." : "Save Template"}
          </button>
        </div>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      <div className={styles.editorContainer}>
        <div className={styles.editorColumn}>
          <div className={styles.columnHeader}>
            <h3>JSON Configuration</h3>
            <button 
              className={styles.secondaryBtn}
              onClick={() => setShowDiff(!showDiff)}
            >
              {showDiff ? "Close Comparison" : "Preview Comparison"}
            </button>
          </div>
          
          <div className={styles.editorLayout}>
            {showDiff && (
              <div className={styles.diffPane}>
                <h4>Production Version</h4>
                <pre>{template.config}</pre>
              </div>
            )}
            <div className={styles.editPane}>
              <h4>Current Draft</h4>
              <textarea
                value={config}
                onChange={(e) => setConfig(e.target.value)}
                spellCheck={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
