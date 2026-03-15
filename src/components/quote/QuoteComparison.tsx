"use client";

import type { PackageComparison, PackageQuoteResult } from "@/engine/types";
import Image from "next/image";
import { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import styles from "./QuoteComparison.module.css";

interface Props {
  comparison: PackageComparison;
}

export function QuoteComparison({ comparison }: Props) {
  const { quotes, sortedByPremium } = comparison;
  const gridRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [failedLogos, setFailedLogos] = useState<Record<string, boolean>>({});

  const handleLogoError = (insurerId: string) => {
    setFailedLogos(prev => ({ ...prev, [insurerId]: true }));
  };

  const handleDownloadPdf = async () => {
    if (!gridRef.current || isExporting) return;
    try {
      setIsExporting(true);
      const canvas = await html2canvas(gridRef.current, { scale: 1.5 });
      const imgData = canvas.toDataURL("image/jpeg", 0.7); // Compress to JPEG
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

  if (quotes.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h2>No packages found</h2>
        <p>We couldn&apos;t find any packages matching your risk profile.</p>
        <button onClick={() => window.history.back()} className={styles.btnSecondary}>
          Edit Profile
        </button>
      </div>
    );
  }

  return (
    <div className={styles.comparisonContainer}>
      {/* LEFT SIDEBAR FILTER */}
      <aside className={styles.sidebar}>
        <h3>Refine Results</h3>
        <div className={styles.filterGroup}>
          <label>
            <input type="checkbox" defaultChecked /> All Insurers
          </label>
        </div>
        <div className={styles.filterGroup}>
          <label>
            <input type="checkbox" defaultChecked /> Best Value Promo
          </label>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT */}
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div>
            <h2>Indicative Quotes ({quotes.length})</h2>
            <p className={styles.subtitle}>
              For <strong>{comparison.businessType}</strong>.
            </p>
          </div>
          <div>
             <select className={styles.btnSecondary} style={{ padding: '0.5rem', marginRight: '1rem' }}>
                <option>Sort by: Lowest Premium</option>
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
        {sortedByPremium.map((quote: PackageQuoteResult, index: number) => {
          // Extract specific coverage limits for horizontal display
          const pl = quote.coverageSummary.publicLiability || "-";
          const pa = quote.coverageSummary.personalAccident || "-";
          const fire = quote.coverageSummary.fireContents || quote.coverageSummary.allRisks || "-";

          return (
          <div
            key={`${quote.insurerId}-${quote.tierId}`}
            className={`${styles.quoteCard} ${index === 0 ? styles.bestValue : ""}`}
            style={{ marginTop: index === 0 ? '1rem' : '0' }}
          >
            {index === 0 && <div className={styles.badge}>Best Value</div>}

            {/* Left Col: Brand and Product */}
            <div className={styles.cardHeader}>
              <div className={styles.insurerLogo}>
                {quote.insurerLogoPath && !failedLogos[quote.insurerId] ? (
                  <Image
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

            {/* Middle Col: Key Metrics horizontally aligned */}
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

            {/* Right Col: Premium & CTA */}
            <div className={styles.premiumBox}>
              <div className={styles.premiumAmount}>
                S$ {(quote.totalPremiumCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className={styles.premiumLabel}>Annual Base Premium<br/>(incl. 9% GST)</div>
              <button className={styles.btnPrimary}>Apply Now</button>
            </div>

            {/* Bottom Row: Details Accordion */}
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
        )})}
      </div>
      </main>
    </div>
  );
}
