import Link from "next/link";
import styles from "./page.module.css";

const coverageTypes = [
  {
    icon: "🛡️",
    name: "WICA",
    desc: "Work Injury Compensation",
    tag: "Mandatory",
  },
  {
    icon: "🏢",
    name: "Public Liability",
    desc: "Third-party bodily injury & property damage",
    tag: "Common",
  },
  {
    icon: "⚖️",
    name: "Professional Indemnity",
    desc: "Negligent advice & errors coverage",
    tag: "Service SMEs",
  },
  {
    icon: "🔥",
    name: "Fire & Property",
    desc: "Physical assets protection",
    tag: "Asset Protection",
  },
  {
    icon: "📉",
    name: "Business Interruption",
    desc: "Loss of income coverage",
    tag: "Income Protection",
  },
  {
    icon: "🏥",
    name: "Foreign Worker Medical",
    desc: "MOM-mandated medical coverage",
    tag: "Mandatory",
  },
];

export default function HomePage() {
  return (
    <div className={styles.hero}>
      <div className="container">
        <h1 className={styles.title}>
          Compare SME Insurance
          <span className={styles.titleAccent}> Instantly</span>
        </h1>
        <p className={styles.subtitle}>
          Get indicative quotations across multiple Singapore insurers for WICA,
          Public Liability, Professional Indemnity, Fire &amp; Property,
          Business Interruption, and Foreign Worker Medical insurance.
        </p>
        <div className={styles.ctaGroup}>
          <Link href="/quote" className={styles.ctaPrimary}>
            Get Quotes Now
          </Link>
          <Link href="/disclaimer" className={styles.ctaSecondary}>
            How It Works
          </Link>
        </div>

        {/* Coverage Types */}
        <p className={styles.sectionLabel}>Coverage Types Available</p>
        <div className={styles.coverageGrid}>
          {coverageTypes.map((coverage) => (
            <div key={coverage.name} className={styles.coverageCard}>
              <div className={styles.coverageIconWrap}>
                <span>{coverage.icon}</span>
              </div>
              <div className={styles.coverageBody}>
                <div className={styles.coverageHeader}>
                  <h3 className={styles.coverageName}>{coverage.name}</h3>
                  <span className={styles.coverageTag}>{coverage.tag}</span>
                </div>
                <p className={styles.coverageDesc}>{coverage.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
