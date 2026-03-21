import { describe, it, expect } from "vitest";
import { calculatePackageQuote } from "@/engine/calculators/calculatePackage";
import type { InsurerPackage, PackageTier, FnbBusinessProfile } from "@/engine/types";

describe("calculatePackageQuote - MSIG", () => {
  const msigPackage: InsurerPackage = {
    insurerId: "msig",
    productName: "F&B Package",
    tiers: [
      {
        id: "msig_fnb",
        name: "F&B Plan",
        description: "Standard F&B coverage",
        basePremiumCents: 89000, // S$890.00
        baseCoverage: {
          fireContents: { description: "S$100,000", sumInsuredCents: 10000000 },
          publicLiability: { description: "S$1,000,000", limitCents: 100000000 },
        },
      },
    ],
    topUpRates: {
      wica: {
        perEmployeeCents: { fnb: 5000 }, // S$50.00
      },
      fireContents: {
        ratePer10000Cents: { fnb: 1500 }, // S$15.00 per $10k
      },
    },
    optionalCovers: [],
    specialFeatures: ["24/7 Helpline"],
    keyExclusions: ["War", "Nuclear"],
  };

  it("calculates base premium correctly with no add-ons", () => {
    const profile: FnbBusinessProfile = {
      companyName: "Test Cafe",
      uen: "12345678A",
      businessType: "fnb",
      additionalEmployees: 0,
      additionalSumInsuredCents: 0,
      additionalPlLimitCents: 0,
      additionalPaPersons: 0,
      additionalDailyBenefitCents: 0,
      wicaRequired: false,
      wicaEmployees: [],
    };

    const result = calculatePackageQuote(
      msigPackage,
      msigPackage.tiers[0],
      "MSIG",
      "/logos/msig.png",
      profile
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.quote.basePremiumCents).toBe(89000);
      expect(result.quote.totalPremiumCents).toBe(89000);
      expect(result.quote.topUpBreakdown).toHaveLength(0);
    }
  });

  it("calculates top-ups for additional employees", () => {
    const profile: FnbBusinessProfile = {
      companyName: "Test Cafe",
      uen: "12345678A",
      businessType: "fnb",
      additionalEmployees: 5,
      additionalSumInsuredCents: 0,
      additionalPlLimitCents: 0,
      additionalPaPersons: 0,
      additionalDailyBenefitCents: 0,
      wicaRequired: false,
      wicaEmployees: [],
    };

    const result = calculatePackageQuote(
      msigPackage,
      msigPackage.tiers[0],
      "MSIG",
      "/logos/msig.png",
      profile
    );

    expect(result.success).toBe(true);
    if (result.success) {
      // 89000 + (5 * 5000) = 89000 + 25000 = 114000
      expect(result.quote.totalPremiumCents).toBe(114000);
      expect(result.quote.topUpBreakdown).toContainEqual(
        expect.objectContaining({ name: "Additional WICA Employees", amountCents: 25000 })
      );
    }
  });

  it("calculates top-ups for additional fire contents", () => {
    const profile: FnbBusinessProfile = {
      companyName: "Test Cafe",
      uen: "12345678A",
      businessType: "fnb",
      additionalEmployees: 0,
      additionalSumInsuredCents: 5000000, // S$50,000 (5 units of $10k)
      additionalPlLimitCents: 0,
      additionalPaPersons: 0,
      additionalDailyBenefitCents: 0,
      wicaRequired: false,
      wicaEmployees: [],
    };

    const result = calculatePackageQuote(
      msigPackage,
      msigPackage.tiers[0],
      "MSIG",
      "/logos/msig.png",
      profile
    );

    expect(result.success).toBe(true);
    if (result.success) {
      // 89000 + (5 * 1500) = 89000 + 7500 = 96500
      expect(result.quote.totalPremiumCents).toBe(96500);
      expect(result.quote.topUpBreakdown).toContainEqual(
        expect.objectContaining({ name: "Additional Fire & Extraneous Perils", amountCents: 7500 })
      );
    }
  });

  it("returns error if tier has no base premium", () => {
    const customTier: PackageTier = {
      id: "msig_custom",
      name: "Custom Plan",
      description: "Custom quote required",
      basePremiumCents: null,
      baseCoverage: null,
    };

    const profile: FnbBusinessProfile = {
      companyName: "Test Cafe",
      uen: "12345678A",
      businessType: "fnb",
      additionalEmployees: 0,
      additionalSumInsuredCents: 0,
      additionalPlLimitCents: 0,
      additionalPaPersons: 0,
      additionalDailyBenefitCents: 0,
      wicaRequired: false,
      wicaEmployees: [],
    };

    const result = calculatePackageQuote(
      msigPackage,
      customTier,
      "MSIG",
      "/logos/msig.png",
      profile
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("NO_BASE_PREMIUM");
    }
  });
});
