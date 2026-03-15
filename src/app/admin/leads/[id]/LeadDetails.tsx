"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./lead-details.module.css";

export default function LeadDetails({ id }: { id: string }) {
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchLead();
  }, [id]);

  const fetchLead = async () => {
    try {
      const res = await fetch(`/api/admin/leads/${id}`);
      const data = await res.json();
      setLead(data);
      setStatus(data.status);
      setNotes(data.internalNotes || "");
    } catch (err) {
      console.error("Failed to fetch lead");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/admin/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, internalNotes: notes }),
      });
      router.refresh();
      alert("Lead updated successfully");
    } catch (err) {
      alert("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading lead details...</div>;
  if (!lead) return <div>Lead not found.</div>;

  const quoteData = JSON.parse(lead.quoteData);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={() => router.back()} className={styles.backBtn}>← Back</button>
        <h1>{lead.companyName}</h1>
      </header>

      <div className={styles.grid}>
        <div className={styles.detailsCard}>
          <section className={styles.section}>
            <h3>Contact Information</h3>
            <p><strong>Name:</strong> {lead.contactName}</p>
            <p><strong>Email:</strong> {lead.contactEmail}</p>
            <p><strong>Phone:</strong> {lead.contactPhone}</p>
            <p><strong>UEN:</strong> {lead.uen}</p>
          </section>

          <section className={styles.section}>
            <h3>Business Details</h3>
            <p><strong>Type:</strong> {lead.businessType}</p>
            <p><strong>Employees:</strong> {lead.additionalEmployees}</p>
          </section>

          <section className={styles.section}>
            <h3>Quote Comparison</h3>
            <div className={styles.quoteList}>
              {quoteData.quotes?.map((q: any, idx: number) => (
                <div key={idx} className={styles.quoteRow}>
                  <div className={styles.quoteRowContent}>
                    <div className={styles.quoteMain}>
                      <p className={styles.insurerName}>{q.insurerName}</p>
                      <p className={styles.packageName}>{q.productName} - {q.tierName}</p>
                    </div>
                    <div className={styles.premium}>
                      ${(q.totalPremiumCents / 100).toFixed(2)}
                    </div>
                  </div>
                  
                  {q.coverageSummary && Object.keys(q.coverageSummary).length > 0 && (
                    <div className={styles.coverageGrid}>
                      {Object.entries(q.coverageSummary).map(([key, value]: [string, any]) => (
                        <div key={key} className={styles.coverageItem}>
                          <span className={styles.coverageLabel}>
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </span>
                          <span className={styles.coverageValue}>{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className={styles.actionsCard}>
          <section className={styles.section}>
            <h3>Lead status</h3>
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
              className={styles.select}
            >
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="QUOTED">Quoted</option>
              <option value="CLOSED">Closed / Won</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </section>

          <section className={styles.section}>
            <h3>Internal Notes</h3>
            <textarea 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your notes here..."
              rows={6}
              className={styles.textarea}
            />
          </section>

          <button 
            onClick={handleSave} 
            disabled={saving}
            className={styles.saveBtn}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
