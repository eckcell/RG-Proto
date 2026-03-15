"use client";

import { useState, useEffect } from "react";
import styles from "./leads.module.css";
import Link from "next/link";

interface Lead {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  businessType: string;
  status: string;
  createdAt: string;
}

export default function LeadsTable() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/admin/leads");
      const data = await res.json();
      setLeads(data.leads || []);
    } catch (err) {
      console.error("Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter(l => 
    l.companyName.toLowerCase().includes(search.toLowerCase()) ||
    l.contactName.toLowerCase().includes(search.toLowerCase()) ||
    l.contactEmail.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = () => {
    // 1. Define headers
    const headers = ["Company", "Contact", "Email", "Type", "Status", "Date"];
    
    // 2. Helper to escape CSV values (wrap in quotes if comma/quote exists)
    const escape = (val: string) => {
      const stringVal = String(val ?? "");
      if (stringVal.includes(",") || stringVal.includes('"') || stringVal.includes("\n")) {
        return `"${stringVal.replace(/"/g, '""')}"`;
      }
      return stringVal;
    };

    // 3. Construct CSV rows with escaping
    const csvRows = [
      headers.join(","),
      ...filteredLeads.map(l => [
        escape(l.companyName),
        escape(l.contactName),
        escape(l.contactEmail),
        escape(l.businessType),
        escape(l.status),
        escape(new Date(l.createdAt).toLocaleDateString())
      ].join(","))
    ];

    // 4. Join rows and create Blob
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    
    // 5. Trigger download
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const timestamp = new Date().toISOString().split('T')[0];
    
    link.href = url;
    link.download = `riskguard_leads_${timestamp}.csv`;
    link.style.display = "none";
    
    document.body.appendChild(link);
    link.click();
    
    // Add small delay before cleanup to ensure browser initiates download with correct filename
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  };

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.tableHeader}>
        <div className={styles.searchBar}>
          <input 
            type="text" 
            placeholder="Search leads..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button onClick={handleExport} className={styles.exportBtn}>
          Export to CSV
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Company</th>
              <th>Contact</th>
              <th>Type</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className={styles.loading}>Loading leads...</td></tr>
            ) : filteredLeads.length === 0 ? (
              <tr><td colSpan={6} className={styles.empty}>No leads found.</td></tr>
            ) : (
              filteredLeads.map(lead => (
                <tr key={lead.id}>
                  <td>
                    <div className={styles.companyInfo}>
                      <p className={styles.companyName}>{lead.companyName}</p>
                      <p className={styles.uen}>{lead.contactEmail}</p>
                    </div>
                  </td>
                  <td>{lead.contactName}</td>
                  <td><span className={styles.typeBadge}>{lead.businessType}</span></td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[`status_${lead.status.toLowerCase()}`]}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Link href={`/admin/leads/${lead.id}`} className={styles.viewLink}>
                      View Details
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
