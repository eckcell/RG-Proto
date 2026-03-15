/**
 * Package Comparator — Cross-Insurer Comparison Engine
 *
 * Takes an F&B business profile and produces comparable quotes
 * across all eligible packages/tiers from all insurers.
 *
 * Now supports asynchronous data loading from the database.
 */

import type {
  FnbBusinessProfile,
  PackageComparison,
  PackageQuoteResult,
  PackageCalculatorResult,
} from "@/engine/types";
import { getPackages, getInsurerById } from "@/data/loader";
import { calculatePackageQuote } from "@/engine/calculators/calculatePackage";

/**
 * Map business type keywords to tier IDs for matching.
 */
function isTierEligible(tierId: string, tierName: string, tierDesc: string, businessType: string): boolean {
  const bt = businessType.toLowerCase();
  const haystack = `${tierId} ${tierName} ${tierDesc}`.toLowerCase();

  if (haystack.includes(bt)) return true;

  const synonyms: Record<string, string[]> = {
    restaurant: ["restaurant", "dining", "eating house", "cafe", "coffee house"],
    stall: ["stall", "food court", "coffee shop"],
    takeaway: ["take-away", "takeaway", "kiosk", "deli", "bakery", "confectionary", "ice-cream"],
    pub: ["pub", "bar", "lounge", "wine bar"],
    office: ["office", "service"],
    retail: ["retail", "shop", "trading"],
    fnb: ["food", "beverage", "f&b", "fnb"],
  };

  const synList = synonyms[bt] ?? [];
  return synList.some((syn) => haystack.includes(syn));
}

/**
 * Compare packages across all insurers for a given F&B business profile.
 */
export async function comparePackages(
  profile: FnbBusinessProfile
): Promise<PackageComparison> {
  const allPackages = await getPackages();
  const quotes: PackageQuoteResult[] = [];

  for (const pkg of allPackages) {
    const insurer = await getInsurerById(pkg.insurerId);
    const insurerName = insurer?.name ?? pkg.insurerId;
    const insurerLogoPath = insurer?.logoPath || "";

    for (const tier of pkg.tiers) {
      if (
        !isTierEligible(tier.id, tier.name, tier.description, profile.businessType)
      ) {
        continue;
      }

      const result: PackageCalculatorResult = calculatePackageQuote(
        pkg,
        tier,
        insurerName,
        profile
      );

      if (result.success) {
        quotes.push({
          ...result.quote,
          insurerLogoPath
        });
      }
    }
  }

  const sortedByPremium = [...quotes].sort(
    (a, b) => a.totalPremiumCents - b.totalPremiumCents
  );

  return {
    businessType: profile.businessType,
    quotes,
    sortedByPremium,
  };
}

/**
 * Get a quick summary of available packages for a business type.
 */
export async function getAvailablePackagesForType(
  businessType: string
): Promise<Array<{ insurerId: string; productName: string; tierName: string; basePremiumCents: number | null }>> {
  const allPackages = await getPackages();
  const available: Array<{
    insurerId: string;
    productName: string;
    tierName: string;
    basePremiumCents: number | null;
  }> = [];

  for (const pkg of allPackages) {
    for (const tier of pkg.tiers) {
      if (isTierEligible(tier.id, tier.name, tier.description, businessType)) {
        available.push({
          insurerId: pkg.insurerId,
          productName: pkg.productName,
          tierName: tier.name,
          basePremiumCents: tier.basePremiumCents,
        });
      }
    }
  }

  return available;
}
