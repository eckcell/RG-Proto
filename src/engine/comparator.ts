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
  InsurerPackage,
} from "@/engine/types";
import { prisma } from "@/lib/prisma";
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
 * Compare packages across all insurers for a given industry and profile.
 */
export async function comparePackages(
  profile: any,
  industrySlug: string = "fnb"
): Promise<PackageComparison> {
  // 1. Fetch industry first to get ID
  const industry = await (prisma as any).industry.findUnique({
    where: { slug: industrySlug }
  });

  if (!industry) {
    return {
      businessType: industrySlug,
      quotes: [],
      sortedByPremium: [],
    };
  }

  // 2. Fetch products for this industry
  const products = await (prisma as any).product.findMany({
    where: { 
        industryId: industry.id,
        active: true 
    },
    include: { insurer: true }
  });

  const quotes: PackageQuoteResult[] = [];

  for (const prod of products) {
    const pkg: InsurerPackage = JSON.parse(prod.configuration);
    const insurerName = prod.insurer?.name || "Unknown";
    const insurerLogoPath = prod.insurer?.logoPath || "";

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
        insurerLogoPath,
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
    businessType: profile.businessType || industrySlug,
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
  const products = await (prisma as any).product.findMany({
    where: { 
        industry: { slug: "fnb" }, // Fallback for this legacy function
        active: true 
    }
  });

  const available: any[] = [];
  for (const pkgObj of products) {
    const pkg: InsurerPackage = JSON.parse(pkgObj.configuration);
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

  return available;
}
