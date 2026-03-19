import Link from "next/link";
import styles from "./page.module.css";

const coverageTypes = [
  { icon: "🛡️", name: "WICA", desc: "Work Injury Compensation", tag: "Mandatory" },
  { icon: "🏢", name: "Public Liability", desc: "Third-party liability", tag: "Common" },
  { icon: "⚖️", name: "Indemnity", desc: "Professional errors coverage", tag: "Service SMEs" },
  { icon: "🔥", name: "Property", desc: "Physical assets protection", tag: "Assets" },
  { icon: "📉", name: "Business", desc: "Income loss protection", tag: "Income" },
  { icon: "🏥", name: "Medical", desc: "Foreign worker healthcare", tag: "Mandatory" },
];

export default function HomeProposal() {
  return (
    <div className={styles.wrapper}>
      {/* Decorative Background Element */}
      <div className={styles.orb} aria-hidden="true" />
      
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.preTitle}>Risk Management Redefined</span>
            <h1 className={styles.title}>
              Intelligent SME Insurance <br />
              <span className={styles.titleHighlight}>Comparison.</span>
            </h1>
            <p className={styles.subtitle}>
              A meticulously designed platform for Singaporean businesses to compare 
              indicative quotations with absolute precision and clarity.
            </p>
            <div className={styles.ctaGroup}>
              <Link href="/quote" className={styles.ctaPrimary}>
                Begin Comparison
              </Link>
              <Link href="/disclaimer" className={styles.ctaSecondary}>
                Methodology
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.services}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Precision Coverage</h2>
            <div className={styles.line} />
          </div>
          
          <div className={styles.grid}>
            {coverageTypes.map((type, i) => (
              <div 
                key={type.name} 
                className={styles.card}
                style={{ "--index": i } as React.CSSProperties}
              >
                <div className={styles.cardIcon}>{type.icon}</div>
                <div className={styles.cardMeta}>
                  <span className={styles.cardTag}>{type.tag}</span>
                  <h3 className={styles.cardName}>{type.name}</h3>
                </div>
                <p className={styles.cardDesc}>{type.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.trust}>
          <div className={styles.trustContent}>
            <h3>Global Standard. Local Expertise.</h3>
            <p>RiskGuard integrates with major Singaporean insurers to provide real-time indicative data.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
