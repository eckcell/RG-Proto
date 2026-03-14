/**
 * Data Loader Module
 *
 * Centralised access to all package data and reference data.
 * In MVP, data is loaded from static JSON files.
 * Post-MVP, this will be replaced with API/DB calls.
 *
 * v2 — Bundled package model with typed accessors.
 */

import type {
  Insurer,
  InsurerPackage,
  SsicCode,
  PackageTier,
  OptionalCover,
} from "@/engine/types";

import insurersData from "@/data/insurers.json";
import packagesData from "@/data/packages.json";
import ssicCodesData from "@/data/ssic-codes.json";

// ── Insurer Accessors ───────────────────────────────────

/** All available insurers */
export function getInsurers(): Insurer[] {
  return insurersData.insurers as Insurer[];
}

/** Get a single insurer by ID */
export function getInsurerById(id: string): Insurer | undefined {
  return getInsurers().find((i) => i.id === id);
}

// ── SSIC Code Accessors ─────────────────────────────────

/** All SSIC codes */
export function getSsicCodes(): SsicCode[] {
  return ssicCodesData.codes as SsicCode[];
}

/** Find SSIC code by code string */
export function findSsicCode(code: string): SsicCode | undefined {
  return getSsicCodes().find((s) => s.code === code);
}

/** Search SSIC codes by description keyword */
export function searchSsicCodes(query: string): SsicCode[] {
  const lower = query.toLowerCase();
  return getSsicCodes().filter(
    (s) =>
      s.description.toLowerCase().includes(lower) || s.code.includes(query)
  );
}

/** Get risk category for a given SSIC code */
export function getRiskCategory(
  ssicCode: string
): "low" | "medium" | "high" | "very_high" {
  const code = findSsicCode(ssicCode);
  return code?.riskCategory ?? "medium";
}

// ── Package Accessors ───────────────────────────────────

/** All insurer packages (MSIG, EQ F&B, EQ Pubs, Liberty) */
export function getPackages(): InsurerPackage[] {
  return packagesData.packages as unknown as InsurerPackage[];
}

/** Get all packages for a specific insurer */
export function getPackagesByInsurer(insurerId: string): InsurerPackage[] {
  return getPackages().filter((p) => p.insurerId === insurerId);
}

/** Get a specific package by insurer + product name */
export function getPackage(
  insurerId: string,
  productName: string
): InsurerPackage | undefined {
  return getPackages().find(
    (p) => p.insurerId === insurerId && p.productName === productName
  );
}

/**
 * Get all tiers across all packages, optionally filtered by insurer.
 * Includes the parent package's insurerId and productName.
 */
export function getAllTiers(insurerId?: string): Array<
  PackageTier & { insurerId: string; productName: string }
> {
  const packages = insurerId
    ? getPackagesByInsurer(insurerId)
    : getPackages();

  return packages.flatMap((pkg) =>
    pkg.tiers.map((tier) => ({
      ...tier,
      insurerId: pkg.insurerId,
      productName: pkg.productName,
    }))
  );
}

/** Get a specific tier by its unique ID */
export function getTierById(
  tierId: string
): (PackageTier & { insurerId: string; productName: string }) | undefined {
  return getAllTiers().find((t) => t.id === tierId);
}

/**
 * Find tiers that match a business type keyword.
 * E.g., "restaurant" will match EQ Restaurant, Liberty Restaurant.
 */
export function findTiersByBusinessType(
  businessType: string
): Array<PackageTier & { insurerId: string; productName: string }> {
  const lower = businessType.toLowerCase();
  return getAllTiers().filter(
    (t) =>
      t.name.toLowerCase().includes(lower) ||
      t.description.toLowerCase().includes(lower) ||
      t.id.toLowerCase().includes(lower)
  );
}

/** Get top-up rates for a given insurer package */
export function getTopUpRates(
  insurerId: string,
  productName: string
): Record<string, unknown> | undefined {
  const pkg = getPackage(insurerId, productName);
  return pkg?.topUpRates;
}

/** Get optional covers for a given insurer package */
export function getOptionalCovers(
  insurerId: string,
  productName: string
): OptionalCover[] {
  const pkg = getPackage(insurerId, productName);
  return (pkg?.optionalCovers ?? []) as OptionalCover[];
}

/**
 * Get WICA optional cover data for a given package.
 * Returns the WICA optional cover object or undefined.
 */
export function getWicaCover(
  insurerId: string,
  productName: string
): OptionalCover | undefined {
  return getOptionalCovers(insurerId, productName).find(
    (c) => c.id === "wica"
  );
}

// ── Data Version Info ───────────────────────────────────

/** Get version and last-updated metadata for the packages data */
export function getPackagesVersion(): {
  version: string;
  lastUpdated: string;
} {
  return {
    version: packagesData.version,
    lastUpdated: packagesData.lastUpdated,
  };
}

// ── Rate Data Freshness Check ───────────────────────────

const STALENESS_THRESHOLD_MS = 6 * 30 * 24 * 60 * 60 * 1000; // ~6 months

/** Check if the package data is older than 6 months */
export function checkDataStaleness(): {
  isStale: boolean;
  lastUpdated: string;
} {
  const updatedAt = new Date(packagesData.lastUpdated).getTime();
  const isStale = Date.now() - updatedAt > STALENESS_THRESHOLD_MS;
  return { isStale, lastUpdated: packagesData.lastUpdated };
}
