/**
 * Package Calculator — Bundled F&B Package Premium Engine
 *
 * Calculates total premium for a selected insurer package tier,
 * including base premium + top-up adjustments + optional covers.
 *
 * All monetary values are in CENTS. Premiums include 9% GST
 * (matching the source brochure data format).
 *
 * This module is a pure function — NO React, NO side effects.
 */

import type {
  InsurerPackage,
  PackageTier,
  PackageQuoteResult,
  PackageCalculatorResult,
  TopUpLineItem,
  FnbBusinessProfile,
  WicaEmployeeInput,
  OptionalCover,
} from "@/engine/types";

// ── Helpers ─────────────────────────────────────────────

function roundToDollar(cents: number): number {
  return Math.round(cents / 100) * 100;
}

/**
 * Safely read a numeric rate from a top-up rate object that is keyed
 * by tier shorthand (e.g. "office", "retail", "fnb").
 */
function getRateByCategoryKey(
  rateObj: Record<string, unknown> | undefined,
  key: string
): number | undefined {
  if (!rateObj || typeof rateObj !== "object") return undefined;
  const val = rateObj[key];
  return typeof val === "number" ? val : undefined;
}

/**
 * Determine the tier-category key used in top-up rate objects.
 * Maps tier IDs to the shorthand used in the JSON (e.g. msig_fnb → "fnb").
 */
function tierCategoryKey(tierId: string): string {
  // MSIG: msig_office → office, msig_retail → retail, msig_fnb → fnb
  if (tierId.startsWith("msig_")) return tierId.replace("msig_", "");
  // EQ & Liberty don't use category-keyed top-ups the same way
  // Default: use the last segment
  const parts = tierId.split("_");
  return parts[parts.length - 1];
}

// ── MSIG Top-Up Calculator ──────────────────────────────

function calculateMsigTopUps(
  pkg: InsurerPackage,
  tier: PackageTier,
  profile: FnbBusinessProfile
): TopUpLineItem[] {
  const items: TopUpLineItem[] = [];
  const catKey = tierCategoryKey(tier.id);
  const rates = pkg.topUpRates as Record<string, Record<string, unknown>>;

  // Additional employees (WICA)
  if (profile.additionalEmployees > 0 && rates.wica) {
    const perEmp = getRateByCategoryKey(
      rates.wica.perEmployeeCents as Record<string, unknown>,
      catKey
    );
    if (perEmp) {
      const amount = perEmp * profile.additionalEmployees;
      items.push({
        name: "Additional WICA Employees",
        description: `${profile.additionalEmployees} additional employee(s) @ S$${(perEmp / 100).toFixed(2)}`,
        amountCents: roundToDollar(amount),
      });
    }
  }

  // Additional fire contents sum insured
  if (profile.additionalSumInsuredCents > 0 && rates.fireContents) {
    const ratePer10k = getRateByCategoryKey(
      rates.fireContents.ratePer10000Cents as Record<string, unknown>,
      catKey
    );
    if (ratePer10k) {
      const units = profile.additionalSumInsuredCents / 1000000; // per $10,000
      const amount = ratePer10k * units;
      items.push({
        name: "Additional Fire & Extraneous Perils",
        description: `S$${(profile.additionalSumInsuredCents / 100).toLocaleString()} additional sum insured`,
        amountCents: roundToDollar(amount),
      });
    }
  }

  // Additional PL
  if (profile.additionalPlLimitCents > 0 && rates.publicLiability) {
    const perIncrement = getRateByCategoryKey(
      rates.publicLiability.perIncrementCents as Record<string, unknown>,
      catKey
    );
    const incrementAmt = (rates.publicLiability as Record<string, unknown>)
      .incrementAmountCents as number;
    if (perIncrement && incrementAmt) {
      const increments = Math.ceil(
        profile.additionalPlLimitCents / incrementAmt
      );
      const amount = perIncrement * increments;
      items.push({
        name: "Additional Public Liability",
        description: `${increments} increment(s) of S$${(incrementAmt / 100).toLocaleString()}`,
        amountCents: roundToDollar(amount),
      });
    }
  }

  // Additional PA persons
  if (profile.additionalPaPersons > 0 && rates.personalAccident) {
    const perPerson = getRateByCategoryKey(
      rates.personalAccident.perPersonCents as Record<string, unknown>,
      catKey
    );
    if (perPerson) {
      const amount = perPerson * profile.additionalPaPersons;
      items.push({
        name: "Additional Personal Accident",
        description: `${profile.additionalPaPersons} additional person(s)`,
        amountCents: roundToDollar(amount),
      });
    }
  }

  return items;
}

// ── EQ Top-Up Calculator ────────────────────────────────

function calculateEqTopUps(
  pkg: InsurerPackage,
  _tier: PackageTier,
  profile: FnbBusinessProfile
): TopUpLineItem[] {
  const items: TopUpLineItem[] = [];
  const rates = pkg.topUpRates as Record<string, Record<string, unknown>>;

  // Additional all-risks sum insured
  if (profile.additionalSumInsuredCents > 0 && rates.allRisks) {
    const ratePercent = rates.allRisks.ratePercent as number;
    if (ratePercent) {
      const amount = (profile.additionalSumInsuredCents * ratePercent) / 100;
      items.push({
        name: "Additional All Risks",
        description: `${ratePercent}% of S$${(profile.additionalSumInsuredCents / 100).toLocaleString()}`,
        amountCents: roundToDollar(amount),
      });
    }
  }

  // Additional PL
  if (profile.additionalPlLimitCents > 0 && rates.publicLiability) {
    const perIncrement = rates.publicLiability.perIncrementCents as number;
    const incrementAmt = rates.publicLiability.incrementCents as number;
    if (perIncrement && incrementAmt) {
      const increments = Math.ceil(
        profile.additionalPlLimitCents / incrementAmt
      );
      const amount = perIncrement * increments;
      items.push({
        name: "Additional Public Liability",
        description: `${increments} increment(s) of S$${(incrementAmt / 100).toLocaleString()}`,
        amountCents: roundToDollar(amount),
      });
    }
  }

  // Additional PA persons
  if (profile.additionalPaPersons > 0 && rates.personalAccident) {
    const perPerson = rates.personalAccident.perPersonCents as number;
    if (perPerson) {
      const amount = perPerson * profile.additionalPaPersons;
      items.push({
        name: "Additional Personal Accident",
        description: `${profile.additionalPaPersons} additional person(s)`,
        amountCents: roundToDollar(amount),
      });
    }
  }

  // Additional daily benefit (consequential loss)
  if (
    profile.additionalDailyBenefitCents > 0 &&
    rates.consequentialLoss
  ) {
    const topUpPer50 = rates.consequentialLoss
      .dailyBenefitTopUpCents as number;
    if (topUpPer50) {
      const increments = Math.ceil(
        profile.additionalDailyBenefitCents / 5000 // per S$50
      );
      const amount = topUpPer50 * increments;
      items.push({
        name: "Additional Consequential Loss",
        description: `${increments} increment(s) of S$50/day`,
        amountCents: roundToDollar(amount),
      });
    }
  }

  return items;
}

// ── Liberty Top-Up Calculator ───────────────────────────

function calculateLibertyTopUps(
  pkg: InsurerPackage,
  _tier: PackageTier,
  profile: FnbBusinessProfile
): TopUpLineItem[] {
  const items: TopUpLineItem[] = [];
  const rates = pkg.topUpRates as Record<string, Record<string, unknown>>;

  // Additional all-risks
  if (profile.additionalSumInsuredCents > 0 && rates.allRisks) {
    const ratePer25k = rates.allRisks.ratePer25000Cents as number;
    if (ratePer25k) {
      const increments = Math.ceil(
        profile.additionalSumInsuredCents / 2500000
      ); // per S$25,000
      const amount = ratePer25k * increments;
      items.push({
        name: "Additional All Risks",
        description: `${increments} increment(s) of S$25,000`,
        amountCents: roundToDollar(amount),
      });
    }
  }

  // Additional PL
  if (profile.additionalPlLimitCents > 0 && rates.publicLiability) {
    const ratePer500k = rates.publicLiability.ratePer500000Cents as number;
    if (ratePer500k) {
      const increments = Math.ceil(
        profile.additionalPlLimitCents / 50000000 // per S$500,000
      );
      const amount = ratePer500k * increments;
      items.push({
        name: "Additional Public Liability",
        description: `${increments} increment(s) of S$500,000`,
        amountCents: roundToDollar(amount),
      });
    }
  }

  // Additional food & beverage extension
  if (profile.additionalPlLimitCents > 0 && rates.foodBeverageExtension) {
    const ratePer50k = rates.foodBeverageExtension
      .ratePer50000Cents as number;
    if (ratePer50k) {
      const increments = Math.ceil(
        profile.additionalPlLimitCents / 5000000 // per S$50,000
      );
      const amount = ratePer50k * increments;
      items.push({
        name: "Additional F&B Extension",
        description: `${increments} increment(s) of S$50,000`,
        amountCents: roundToDollar(amount),
      });
    }
  }

  return items;
}

// ── WICA Add-On Calculator ──────────────────────────────

function calculateWicaAddon(
  pkg: InsurerPackage,
  employees: WicaEmployeeInput[]
): TopUpLineItem[] {
  const wicaCover = pkg.optionalCovers.find(
    (c: OptionalCover) => c.id === "wica"
  );
  if (!wicaCover || employees.length === 0) return [];

  const items: TopUpLineItem[] = [];

  // EQ F&B uses ratesByOccupation (rate % on annual wage)
  if (wicaCover.ratesByOccupation) {
    for (const emp of employees) {
      const classRate =
        wicaCover.ratesByOccupation[emp.occupationClass];
      if (classRate) {
        const amount =
          (emp.annualWageCents * classRate.ratePercent * emp.headcount) / 100;
        items.push({
          name: `WICA — ${classRate.description}`,
          description: `${emp.headcount} employee(s) × ${classRate.ratePercent}% of S$${(emp.annualWageCents / 100).toLocaleString()}`,
          amountCents: roundToDollar(amount),
        });
      }
    }
  }

  // EQ Pubs & Liberty use ratesByWageBand (flat per-employee rate)
  if (wicaCover.ratesByWageBand) {
    for (const emp of employees) {
      const bandRate =
        wicaCover.ratesByWageBand[emp.occupationClass];
      if (bandRate) {
        const amount = bandRate.perEmployeeCents * emp.headcount;
        items.push({
          name: `WICA — ${bandRate.description}`,
          description: `${emp.headcount} employee(s) × S$${(bandRate.perEmployeeCents / 100).toFixed(2)}`,
          amountCents: roundToDollar(amount),
        });
      }
    }
  }

  return items;
}

// ── Main Calculator ─────────────────────────────────────

/**
 * Calculate a full package quote for a given insurer package + tier + profile.
 *
 * @returns PackageCalculatorResult — success with detailed quote, or error.
 */
export function calculatePackageQuote(
  pkg: InsurerPackage,
  tier: PackageTier,
  insurerName: string,
  profile: FnbBusinessProfile
): PackageCalculatorResult {
  // Guard: tier must have a base premium
  if (tier.basePremiumCents === null) {
    return {
      success: false,
      error: {
        code: "NO_BASE_PREMIUM",
        message: `${insurerName} ${tier.name} requires a custom quote. ${tier.basePremiumNote ?? "Contact the insurer directly."}`,
      },
    };
  }

  // 1. Base premium
  const basePremiumCents = tier.basePremiumCents;

  // 2. Top-ups — dispatch to insurer-specific calculator
  let topUpBreakdown: TopUpLineItem[];
  if (pkg.insurerId === "msig") {
    topUpBreakdown = calculateMsigTopUps(pkg, tier, profile);
  } else if (pkg.insurerId === "liberty") {
    topUpBreakdown = calculateLibertyTopUps(pkg, tier, profile);
  } else {
    // EQ (F&B or Pubs)
    topUpBreakdown = calculateEqTopUps(pkg, tier, profile);
  }
  const totalTopUpCents = topUpBreakdown.reduce(
    (sum, item) => sum + item.amountCents,
    0
  );

  // 3. WICA add-on (optional)
  let optionalCoverBreakdown: TopUpLineItem[] = [];
  if (profile.wicaRequired && profile.wicaEmployees.length > 0) {
    optionalCoverBreakdown = calculateWicaAddon(pkg, profile.wicaEmployees);
  }
  const totalOptionalCents = optionalCoverBreakdown.reduce(
    (sum, item) => sum + item.amountCents,
    0
  );

  // 4. Grand total
  const totalPremiumCents =
    basePremiumCents + totalTopUpCents + totalOptionalCents;

  // 5. Build coverage summary from tier's base coverage
  const coverageSummary: Record<string, string> = {};
  if (tier.baseCoverage) {
    for (const [key, item] of Object.entries(tier.baseCoverage)) {
      coverageSummary[key] = item.description;
    }
  }

  const quote: PackageQuoteResult = {
    insurerId: pkg.insurerId,
    insurerName,
    productName: pkg.productName,
    tierId: tier.id,
    tierName: tier.name,
    basePremiumCents,
    topUpBreakdown,
    totalTopUpCents,
    optionalCoverBreakdown,
    totalOptionalCents,
    totalPremiumCents,
    coverageSummary,
    specialFeatures: pkg.specialFeatures,
    keyExclusions: pkg.keyExclusions,
    effectiveDate:
      ((pkg as unknown as Record<string, unknown>).effectiveDate as string) ??
      new Date().toISOString().slice(0, 10),
  };

  return { success: true, quote };
}
