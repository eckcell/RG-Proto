import { redirect } from "next/navigation";
import { QuoteComparison } from "@/components/quote/QuoteComparison";
import { comparePackages } from "@/engine/comparator";
import type { FnbBusinessProfile, WicaEmployeeInput } from "@/engine/types";
import styles from "@/app/page.module.css";

export const metadata = {
  title: "Compare Insurance Quotes — RiskGuard Compare",
  description: "Compare multiple F&B insurance packages side-by-side.",
};

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const businessType = typeof params.businessType === "string" ? params.businessType : undefined;
  const companyName = typeof params.companyName === "string" ? params.companyName : undefined;

  if (!businessType || !companyName) {
    redirect("/quote");
  }

  // Parse `wicaEmployees` from search parameters if available
  let parsedWicaEmployees: Record<string, any>[] = [];
  if (typeof params.wicaEmployees === "string") {
    try {
      parsedWicaEmployees = JSON.parse(params.wicaEmployees);
    } catch (e) {
      console.error("Failed to parse wicaEmployees", e);
    }
  }

  // Construct the profile from query parameters
  const profile: FnbBusinessProfile = {
    companyName: companyName,
    uen: typeof params.uen === "string" ? params.uen : "",
    businessType: businessType as "office" | "retail" | "fnb",
    additionalEmployees: Number(params.additionalEmployees) || 0,
    additionalSumInsuredCents: (Number(params.additionalSumInsured) || 0) * 100,
    additionalPlLimitCents: (Number(params.additionalPlLimit) || 0) * 100,
    additionalPaPersons: Number(params.additionalPaPersons) || 0,
    additionalDailyBenefitCents: 0,
    wicaRequired: params.wicaRequired === "true",
    wicaEmployees: parsedWicaEmployees.map((emp) => ({
      occupationClass: emp.occupationClass,
      annualWageCents: emp.annualWage * 100, // Search param held 'annualWage' from form
      headcount: emp.headcount,
    })),
  };

  // Run the comparison engine
  const comparison = comparePackages(profile);

  return (
    <div className={styles.main}>
      <QuoteComparison comparison={comparison} />
    </div>
  );
}
