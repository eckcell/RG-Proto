import styles from "./page.module.css";

export const metadata = {
  title: "Legal Disclaimer & Privacy Notice — RiskGuard Compare",
  description:
    "Legal disclaimer and privacy notice for RiskGuard Compare insurance quotation tool.",
};

export default function DisclaimerPage() {
  return (
    <div className="container container--narrow">
      <div className={styles.disclaimerPage}>
        <h1>Legal Disclaimer &amp; Privacy Notice</h1>

        <section className={styles.section}>
          <h2>Important Notice</h2>
          <div className={styles.alertBox}>
            <p>
              <strong>RiskGuard Compare is not a licensed financial adviser.</strong>{" "}
              This tool provides indicative insurance premium estimates for
              comparison purposes only. It does not constitute financial advice,
              insurance advice, or a recommendation to purchase any specific
              insurance product.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Nature of Quotations</h2>
          <ul>
            <li>
              All premiums displayed are <strong>indicative estimates</strong>{" "}
              based on publicly available rate information and general industry
              data.
            </li>
            <li>
              Actual premiums may differ significantly based on individual
              underwriting assessment, claims history, and other factors not
              captured by this tool.
            </li>
            <li>
              Quotations displayed are <strong>not binding offers</strong> from
              any insurer. Users must contact insurers directly for binding
              quotations.
            </li>
            <li>
              Premium estimates are shown both exclusive and inclusive of 9% GST
              (Goods &amp; Services Tax).
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>No Personalised Recommendations</h2>
          <p>
            This tool displays factual, side-by-side comparisons of insurance
            quotations. It does <strong>not</strong> recommend, rank, or advise
            on which policy is suitable for your specific circumstances. Any
            sorting of results (e.g., by premium amount) is for convenience only
            and does not imply a recommendation.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Regulatory Status</h2>
          <p>
            RiskGuard Compare operates as a comparison tool and is not licensed
            under the Financial Advisers Act (Cap. 110) or the Insurance Act
            (Cap. 142) of Singapore. We do not arrange, advise on, or facilitate
            the purchase of insurance policies.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Privacy Notice (PDPA Compliance)</h2>
          <p>
            In accordance with the Personal Data Protection Act 2012 (PDPA) of
            Singapore:
          </p>
          <ul>
            <li>
              We collect only <strong>business information</strong> necessary for
              generating quotations: company name, UEN, SSIC code, employee
              counts, financial figures, and property values.
            </li>
            <li>
              We do <strong>not</strong> collect personal names, NRIC numbers,
              personal contact details, or any other personal data of
              individuals.
            </li>
            <li>
              Data entered into this tool is used <strong>solely</strong> for
              generating indicative quotations during your session.
            </li>
            <li>
              Business data is <strong>not stored, transmitted, or shared</strong>{" "}
              with any third party, including insurers, in the MVP version of
              this tool.
            </li>
            <li>
              All calculations are performed locally and data is discarded when
              you close the browser.
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Rate Data Accuracy</h2>
          <p>
            Insurance rates used in this tool are sourced from publicly available
            information and may not reflect the most current rates. If the rate
            data is more than 6 months old, a warning will be displayed. Users
            should verify all quotations directly with insurers before making any
            decisions.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Limitation of Liability</h2>
          <p>
            RiskGuard Compare, its developers, and affiliates shall not be liable
            for any loss, damage, or expense arising from the use of or reliance
            on information provided by this tool. Users are solely responsible
            for their insurance decisions and should seek independent
            professional advice where appropriate.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Contact</h2>
          <p>
            For questions about this tool or its disclaimer, please contact us at{" "}
            <a href="mailto:info@riskguardcompare.sg">
              info@riskguardcompare.sg
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
