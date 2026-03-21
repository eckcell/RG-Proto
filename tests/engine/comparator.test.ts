import { describe, it, expect, vi, beforeEach } from "vitest";
import { comparePackages } from "@/engine/comparator";
import * as loader from "@/data/loader";
import type { InsurerPackage, FnbBusinessProfile, Insurer } from "@/engine/types";

// Mock the data loader
vi.mock("@/data/loader", () => ({
  getPackages: vi.fn(),
  getInsurerById: vi.fn(),
}));

describe("comparePackages", () => {
  const mockPackages: InsurerPackage[] = [
    {
      insurerId: "msig",
      productName: "MSIG F&B",
      tiers: [
        { id: "msig_fnb", name: "F&B Plan", description: "For restaurants", basePremiumCents: 89000, baseCoverage: {} },
        { id: "msig_office", name: "Office Plan", description: "For offices", basePremiumCents: 50000, baseCoverage: {} },
      ],
      topUpRates: {},
      optionalCovers: [],
      specialFeatures: [],
      keyExclusions: [],
    },
    {
      insurerId: "eq",
      productName: "EQ F&B",
      tiers: [
        { id: "eq_restaurant", name: "Restaurant", description: "For diners", basePremiumCents: 85000, baseCoverage: {} },
      ],
      topUpRates: {},
      optionalCovers: [],
      specialFeatures: [],
      keyExclusions: [],
    }
  ];

  const mockInsurers: Record<string, Insurer> = {
    msig: { id: "msig", name: "MSIG", logoPath: "/msig.png" } as any,
    eq: { id: "eq", name: "EQ Insurance", logoPath: "/eq.png" } as any,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (loader.getPackages as any).mockResolvedValue(mockPackages);
    (loader.getInsurerById as any).mockImplementation(async (id: string) => mockInsurers[id]);
  });

  it("filters eligibility by business type (restaurant)", async () => {
    const profile: FnbBusinessProfile = {
      companyName: "Test Cafe",
      uen: "12345678A",
      businessType: "restaurant",
      additionalEmployees: 0,
      additionalSumInsuredCents: 0,
      additionalPlLimitCents: 0,
      additionalPaPersons: 0,
      additionalDailyBenefitCents: 0,
      wicaRequired: false,
      wicaEmployees: [],
    };

    const result = await comparePackages(profile);

    // Should include MSIG F&B and EQ Restaurant, but NOT MSIG Office
    expect(result.quotes).toHaveLength(2);
    expect(result.quotes.map(q => q.tierId)).toContain("msig_fnb");
    expect(result.quotes.map(q => q.tierId)).toContain("eq_restaurant");
    expect(result.quotes.map(q => q.tierId)).not.toContain("msig_office");
  });

  it("sorts quotes by premium ascending", async () => {
    const profile: FnbBusinessProfile = {
      companyName: "Test Cafe",
      uen: "12345678A",
      businessType: "restaurant",
      additionalEmployees: 0,
      additionalSumInsuredCents: 0,
      additionalPlLimitCents: 0,
      additionalPaPersons: 0,
      additionalDailyBenefitCents: 0,
      wicaRequired: false,
      wicaEmployees: [],
    };

    const result = await comparePackages(profile);

    // EQ (85000) should be before MSIG (89000)
    expect(result.sortedByPremium[0].tierId).toBe("eq_restaurant");
    expect(result.sortedByPremium[1].tierId).toBe("msig_fnb");
    expect(result.sortedByPremium[0].totalPremiumCents).toBeLessThan(result.sortedByPremium[1].totalPremiumCents);
  });

  it("returns empty quotes if no tiers match", async () => {
    const profile: FnbBusinessProfile = {
      companyName: "Test Cafe",
      uen: "12345678A",
      businessType: "industrial", // No matches
      additionalEmployees: 0,
      additionalSumInsuredCents: 0,
      additionalPlLimitCents: 0,
      additionalPaPersons: 0,
      additionalDailyBenefitCents: 0,
      wicaRequired: false,
      wicaEmployees: [],
    };

    const result = await comparePackages(profile);
    expect(result.quotes).toHaveLength(0);
  });
});
