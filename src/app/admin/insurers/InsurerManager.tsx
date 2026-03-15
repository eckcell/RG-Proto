"use client";

import { useState, useEffect } from "react";
import styles from "./insurers.module.css";

interface Insurer {
  id: string;
  name: string;
  fullName: string;
  logoPath: string;
  active: boolean;
}

export default function InsurerManager() {
  const [insurers, setInsurers] = useState<Insurer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingInsurer, setEditingInsurer] = useState<Insurer | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    fullName: "",
    logoPath: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchInsurers();
  }, []);

  const fetchInsurers = async () => {
    try {
      const res = await fetch("/api/admin/insurers");
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setInsurers(data);
      } else {
        console.error("API returned non-array data:", data);
        setInsurers([]);
      }
    } catch (err) {
      console.error("Failed to fetch insurers");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/admin/insurers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentStatus }),
      });
      setInsurers(prev => prev.map(i => i.id === id ? { ...i, active: !currentStatus } : i));
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleEditClick = (insurer: Insurer) => {
    setEditingInsurer(insurer);
    setIsAdding(false);
    setEditForm({
      name: insurer.name,
      fullName: insurer.fullName,
      logoPath: insurer.logoPath,
      description: (insurer as any).description || "",
    });
  };

  const handleAddClick = () => {
    setEditingInsurer(null);
    setIsAdding(true);
    setEditForm({
      name: "",
      fullName: "",
      logoPath: "",
      description: "",
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/insurers/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setEditForm(prev => ({ ...prev, logoPath: data.path }));
    } catch (err) {
      alert("Failed to upload logo");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const method = isAdding ? "POST" : "PATCH";
      const url = isAdding 
        ? "/api/admin/insurers" 
        : `/api/admin/insurers/${editingInsurer?.id}`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (!res.ok) throw new Error("Operation failed");

      const data = await res.json();
      
      if (isAdding) {
        setInsurers(prev => [...prev, data]);
      } else {
        setInsurers(prev => prev.map(i => i.id === data.id ? data : i));
      }
      
      setEditingInsurer(null);
      setIsAdding(false);
    } catch (err) {
      alert("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading insurers...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {insurers.map(insurer => (
          <div key={insurer.id} className={`${styles.card} ${!insurer.active ? styles.inactive : ""}`}>
            <div className={styles.logoWrapper}>
              {insurer.logoPath ? (
                <img src={insurer.logoPath} alt={insurer.name} className={styles.logo} />
              ) : (
                <div className={styles.logoPlaceholder}>{insurer.name.charAt(0)}</div>
              )}
            </div>
            
            <div className={styles.info}>
              <h3>{insurer.name}</h3>
              <p className={styles.fullName}>{insurer.fullName}</p>
              
              <div className={styles.actions}>
                <button 
                  onClick={() => toggleStatus(insurer.id, insurer.active)}
                  className={`${styles.statusBtn} ${insurer.active ? styles.btnActive : styles.btnInactive}`}
                >
                  {insurer.active ? "Enabled" : "Disabled"}
                </button>
                <button 
                  onClick={() => handleEditClick(insurer)}
                  className={styles.editBtn}
                >
                  Edit Details
                </button>
              </div>
            </div>
          </div>
        ))}

        <div onClick={handleAddClick} className={styles.addCard}>
          <div className={styles.addIcon}>+</div>
          <p>Add New Insurer</p>
        </div>
      </div>

      {(editingInsurer || isAdding) && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>{isAdding ? "Add New Insurer" : "Edit Insurer Details"}</h2>
              <button onClick={() => { setEditingInsurer(null); setIsAdding(false); }} className={styles.closeBtn}>×</button>
            </div>
            
            <form onSubmit={handleSave} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Display Name</label>
                <input 
                  type="text" 
                  value={editForm.name}
                  onChange={e => setEditForm({...editForm, name: e.target.value})}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Full Legal Name</label>
                <input 
                  type="text" 
                  value={editForm.fullName}
                  onChange={e => setEditForm({...editForm, fullName: e.target.value})}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Logo Upload</label>
                <div className={styles.uploadContainer}>
                  <input 
                    type="file" 
                    onChange={handleLogoUpload}
                    accept="image/*"
                    className={styles.fileInput}
                    id="logo-upload"
                  />
                  <label htmlFor="logo-upload" className={styles.uploadLabel}>
                    {uploading ? "Processing..." : editForm.logoPath ? "Change Logo" : "Upload Logo"}
                  </label>
                  {editForm.logoPath && <span className={styles.pathHint}>{editForm.logoPath}</span>}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea 
                  value={editForm.description}
                  onChange={e => setEditForm({...editForm, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={() => { setEditingInsurer(null); setIsAdding(false); }} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" disabled={saving || uploading} className={styles.submitBtn}>
                  {saving ? "Saving..." : isAdding ? "Add Insurer" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
