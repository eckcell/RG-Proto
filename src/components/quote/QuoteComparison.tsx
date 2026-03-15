"use client";

import type { PackageComparison, PackageQuoteResult } from "@/engine/types";
import { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import styles from "./QuoteComparison.module.css";

interface Props {
  comparison: PackageComparison;
  leadId?: string;
}

export function QuoteComparison({ comparison, leadId }: Props) {
  const { quotes } = comparison;
  const gridRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [failedLogos, setFailedLogos] = useState<Record<string, boolean>>({});
  
  // Sorting & Filtering State
  const [sortBy, setSortBy] = useState<"premium_asc" | "premium_desc">("premium_asc");
  const [selectedInsurers, setSelectedInsurers] = useState<string[]>([]);
  const [showBestValueOnly, setShowBestValueOnly] = useState(false);
  const [isApplying, setIsApplying] = useState<string | null>(null);

  const allInsurers = Array.from(new Set(quotes.map(q => q.insurerName))).sort();

  const handleLogoError = (insurerId: string) => {
    setFailedLogos(prev => ({ ...prev, [insurerId]: true }));
  };

  const handleInsurerToggle = (name: string) => {
    setSelectedInsurers(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const handleApply = async (quote: PackageQuoteResult) => {
    if (isApplying) return;
    
    try {
      setIsApplying(quote.insurerId + quote.tierId);
      
      // 1. Update Database Selection
      if (leadId) {
        await fetch(`/api/leads/${leadId}/select`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            insurerName: quote.insurerName,
            productName: quote.productName,
            totalPremiumCents: quote.totalPremiumCents,
          }),
        });
      }

      // 2. Immediate WhatsApp Redirect
      const premium = (quote.totalPremiumCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 });
      const message = encodeURIComponent(
        `Hi RiskGuard, I'm interested in the following quote:\n\n` +
        `Insurer: ${quote.insurerName}\n` +
        `Product: ${quote.productName} (${quote.tierName})\n` +
        `Premium: S$ ${premium}\n` +
        `Reference ID: ${leadId || "N/A"}\n\n` +
        `Please advise on next steps.`
      );
      
      const whatsappUrl = `https://wa.me/6588888888?text=${message}`;
      window.open(whatsappUrl, "_blank");
      
    } catch (error) {
      console.error("Selection failed:", error);
      alert("Failed to process selection. Please try again.");
    } finally {
      setIsApplying(null);
    }
  };

  const handleDownloadPdf = async () => {
    if (!gridRef.current || isExporting) return;
    try {
      setIsExporting(true);
      const canvas = await html2canvas(gridRef.current, { 
        scale: 1.5,
        useCORS: true,
        allowTaint: true
      });
      const imgData = canvas.toDataURL("image/jpeg", 0.7);
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "JPEG", 0, 10, pdfWidth, pdfHeight, undefined, "FAST");
      pdf.text("Indicative Quotes (Not Financial Advice)", 10, 8);
      pdf.save(`Quotations_${comparison.businessType}_RiskGuard.pdf`);
    } catch (error) {
      console.error("PDF generation failed", error);
    } finally {
      setIsExporting(false);
    }
  };

  const processedQuotes = [...quotes]
    .filter(q => selectedInsurers.length === 0 || selectedInsurers.includes(q.insurerName))
    .filter((_, idx) => !showBestValueOnly || idx === 0)
    .sort((a, b) => {
      if (sortBy === "premium_asc") return a.totalPremiumCents - b.totalPremiumCents;
      return b.totalPremiumCents - a.totalPremiumCents;
    });

  if (processedQuotes.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h2>No packages found</h2>
        <p>Try adjusting your filters or refine your profile.</p>
        <button 
          onClick={() => {
            setSelectedInsurers([]);
            setShowBestValueOnly(false);
          }} 
          className={styles.btnSecondary}
        >
          Clear Filters
        </button>
      </div>
    );
  }

  return (
    <div className={styles.comparisonContainer}>
      <aside className={styles.sidebar}>
        <h3>Refine Results</h3>
        <div className={styles.filterGroup}>
          <label className={styles.filterTitle}>Insurers</label>
          {allInsurers.map(name => (
            <label key={name} className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={selectedInsurers.includes(name)}
                onChange={() => handleInsurerToggle(name)}
              /> {name}
            </label>
          ))}
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.checkboxLabel}>
            <input 
              type="checkbox" 
              checked={showBestValueOnly}
              onChange={(e) => setShowBestValueOnly(e.target.checked)}
            /> Best Value Only
          </label>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div>
            <h2>Indicative Quotes ({processedQuotes.length})</h2>
            <p className={styles.subtitle}>
              For <strong>{comparison.businessType}</strong>.
            </p>
          </div>
          <div className={styles.headerActions}>
             <select 
                className={styles.btnSecondary} 
                style={{ padding: '0.5rem', marginRight: '1rem' }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
             >
                <option value="premium_asc">Sort by: Lowest Premium</option>
                <option value="premium_desc">Sort by: Highest Premium</option>
             </select>
             <button 
                className={styles.btnPrimary} 
                onClick={handleDownloadPdf} 
                disabled={isExporting}
                style={{ width: 'auto' }}>
               {isExporting ? "Generating PDF..." : "Download as PDF"}
             </button>
          </div>
        </header>

        <div className={styles.quoteGrid} ref={gridRef}>
          {processedQuotes.map((quote: PackageQuoteResult, index: number) => {
            const pl = quote.coverageSummary.publicLiability || "-";
            const pa = quote.coverageSummary.personalAccident || "-";
            const fire = quote.coverageSummary.fireContents || quote.coverageSummary.allRisks || "-";
            
            const isBestValue = quotes.length > 0 && quote.totalPremiumCents === quotes[0].totalPremiumCents;

            return (
              <div
                key={`${quote.insurerId}-${quote.tierId}`}
                className={`${styles.quoteCard} ${isBestValue ? styles.bestValue : ""}`}
                style={{ marginTop: isBestValue ? '1rem' : '0' }}
              >
                {isBestValue && <div className={styles.badge}>Best Value</div>}

                <div className={styles.cardHeader}>
                  <div className={styles.insurerLogo}>
                    {quote.insurerLogoPath && !failedLogos[quote.insurerId] ? (
                      <img
                        src={quote.insurerLogoPath}
                        alt={quote.insurerName}
                        width={100}
                        height={40}
                        style={{ objectFit: "contain" }}
                        onError={() => handleLogoError(quote.insurerId)}
                      />
                    ) : (
                      <span className={styles.insurerNameFallback}>{quote.insurerName}</span>
                    )}
                  </div>
                  <div>
                    <h3 className={styles.productName}>{quote.productName}</h3>
                    <span className={styles.tierName}>{quote.tierName}</span>
                  </div>
                </div>

                <div className={styles.metricsArea}>
                   <div className={styles.metricsGrid}>
                      <div className={styles.metricItem}>
                         <span className={styles.metricValue}>{pl.includes("S$") ? pl.match(/S\$[\d,]+/)?.[0] || 'Covered' : 'Covered'}</span>
                         <span className={styles.metricLabel}>Public Liability</span>
                      </div>
                      <div className={styles.metricItem}>
                         <span className={styles.metricValue}>{pa.includes("S$") ? pa.match(/S\$[\d,]+/)?.[0] || 'Covered' : 'No Cover'}</span>
                         <span className={styles.metricLabel}>Personal Accident</span>
                      </div>
                      <div className={styles.metricItem}>
                         <span className={styles.metricValue}>{fire.includes("S$") ? fire.match(/S\$[\d,]+/)?.[0] || 'Covered' : 'Covered'}</span>
                         <span className={styles.metricLabel}>Property / Fire</span>
                      </div>
                   </div>
                </div>

                <div className={styles.premiumBox}>
                  <div className={styles.premiumAmount}>
                    S$ {(quote.totalPremiumCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <div className={styles.premiumLabel}>Annual Base Premium<br/>(incl. 9% GST)</div>
                  <button 
                    className={styles.btnPrimary}
                    onClick={() => handleApply(quote)}
                    disabled={!!isApplying}
                  >
                    {isApplying === (quote.insurerId + quote.tierId) ? "Applying..." : "Apply Now"}
                  </button>
                </div>

                <div className={styles.costBreakdown}>
                  <details>
                    <summary>More Details <span>▼</span></summary>
                    <div className={styles.breakdownContent}>
                      <div className={styles.breakdownRow}>
                        <span>Base Package Premium</span>
                        <span>S$ {(quote.basePremiumCents / 100).toFixed(2)}</span>
                      </div>
                      {quote.topUpBreakdown.map((item, idx) => (
                        <div key={idx} className={styles.breakdownRow}>
                          <span>{item.name}</span>
                          <span>S$ {(item.amountCents / 100).toFixed(2)}</span>
                        </div>
                      ))}
                      {quote.optionalCoverBreakdown.map((item, idx) => (
                        <div key={idx} className={styles.breakdownRow}>
                          <span className={styles.highlightAdded}>{item.name}</span>
                          <span>S$ {(item.amountCents / 100).toFixed(2)}</span>
                        </div>
                      ))}
                      
                      <div className={styles.featureList}>
                        <h4>Included Covers:</h4>
                        <ul>
                          {Object.entries(quote.coverageSummary).slice(0, 5).map(([key, desc]) => (
                            <li key={key}>{desc}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
