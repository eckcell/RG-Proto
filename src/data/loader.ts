/**
 * Data Loader Module (Refactored for Database)
 *
 * Centralised access to all package data and reference data.
 * This version fetches data from the database asynchronously.
 */

import { prisma } from "@/lib/prisma";
import ssicCodesData from "@/data/ssic-codes.json";
import { z } from "zod";
import type {
  Insurer,
  InsurerPackage,
  SsicCode,
  PackageTier,
  OptionalCover,
} from "@/engine/types";

// ── Prisma Raw Types (for mapping) ──────────────────────
interface PrismaInsurer {
  id: string;
  name: string;
  fullName: string;
  logoPath: string;
  description: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface PrismaProduct {
  id: string;
  insurerId: string;
  name: string;
  productCode: string;
  configuration: string;
  brochureUrl: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Helper to get the schema lazily to avoid initialization order issues
function getInsurerPackageSchema() {
  return z.object({
    insurerId: z.string(),
    productName: z.string(),
    tiers: z.array(z.any()),
    topUpRates: z.record(z.string(), z.any()),
    optionalCovers: z.array(z.any()),
    specialFeatures: z.array(z.string()),
    keyExclusions: z.array(z.string()),
  });
}

// ── Insurer Accessors ───────────────────────────────────

/** All available insurers */
export async function getInsurers(): Promise<Insurer[]> {
  try {
    const dbInsurers = await prisma.insurer.findMany({
      where: { active: true },
    });

    return dbInsurers.map((i: PrismaInsurer) => ({
      id: i.id,
      name: i.name,
      fullName: i.fullName,
      address: "", // Mapping empty as schema is slightly different
      phone: "",
      regNo: "",
      website: "",
      logoPath: i.logoPath,
      productName: "",
      productCode: "",
      effectiveDate: i.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("Failed to fetch insurers from DB:", error);
    return [];
  }
}

/** Get a single insurer by ID */
export async function getInsurerById(id: string): Promise<Insurer | undefined> {
  const insurers = await getInsurers();
  const byId = insurers.find((i) => i.id === id);
  if (byId) return byId;

  // Resilient fallback for legacy insurer IDs used in product JSON config
  const slug = id.toLowerCase();
  return insurers.find((i) => {
    const name = i.name.toLowerCase();
    return (
      (slug === "msig" && name.includes("msig")) ||
      (slug === "eq" && name.includes("eq insurance")) ||
      (slug === "liberty" && name.includes("liberty"))
    );
  });
}

// ── SSIC Code Accessors ─────────────────────────────────

/** All SSIC codes (Static reference data) */
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

/** All insurer packages fetched from DB */
export async function getPackages(): Promise<InsurerPackage[]> {
  try {
    const dbProducts = await prisma.product.findMany({
      where: { active: true },
    });

    return dbProducts.map((p: PrismaProduct) => {
      try {
        if (!p.configuration) {
          console.warn(`Product ${p.id} has no configuration`);
          return null;
        }
        const config = JSON.parse(p.configuration);
        const schema = getInsurerPackageSchema();
        
        if (!schema || typeof schema.parse !== 'function') {
          throw new Error("Zod schema initialization failed - schema is invalid");
        }

        return schema.parse(config) as InsurerPackage;
      } catch (e) {
        console.error(`Failed to parse product configuration for ${p.id}. Error: ${e instanceof Error ? e.message : String(e)}`);
        return null;
      }
    }).filter((p: InsurerPackage | null): p is InsurerPackage => p !== null);
  } catch (error) {
    console.error("Failed to fetch packages from DB:", error);
    return [];
  }
}

/** Get all packages for a specific insurer */
export async function getPackagesByInsurer(insurerId: string): Promise<InsurerPackage[]> {
  const packages = await getPackages();
  return packages.filter((p) => p.insurerId === insurerId);
}

/** Get a specific package by insurer + product name */
export async function getPackage(
  insurerId: string,
  productName: string
): Promise<InsurerPackage | undefined> {
  const packages = await getPackages();
  return packages.find(
    (p) => p.insurerId === insurerId && p.productName === productName
  );
}

/**
 * Get all tiers across all packages.
 */
export async function getAllTiers(insurerId?: string): Promise<Array<
  PackageTier & { insurerId: string; productName: string }
>> {
  const packages = insurerId
    ? await getPackagesByInsurer(insurerId)
    : await getPackages();

  return packages.flatMap((pkg) =>
    pkg.tiers.map((tier) => ({
      ...tier,
      insurerId: pkg.insurerId,
      productName: pkg.productName,
    }))
  );
}

/** Get a specific tier by its unique ID */
export async function getTierById(
  tierId: string
): Promise<(PackageTier & { insurerId: string; productName: string }) | undefined> {
  const tiers = await getAllTiers();
  return tiers.find((t) => t.id === tierId);
}

/** Get top-up rates for a given insurer package */
export async function getTopUpRates(
  insurerId: string,
  productName: string
): Promise<Record<string, unknown> | undefined> {
  const pkg = await getPackage(insurerId, productName);
  return pkg?.topUpRates;
}

/** Get optional covers for a given insurer package */
export async function getOptionalCovers(
  insurerId: string,
  productName: string
): Promise<OptionalCover[]> {
  const pkg = await getPackage(insurerId, productName);
  return (pkg?.optionalCovers ?? []) as OptionalCover[];
}

/** Get WICA optional cover data */
export async function getWicaCover(
  insurerId: string,
  productName: string
): Promise<OptionalCover | undefined> {
  const covers = await getOptionalCovers(insurerId, productName);
  return covers.find((c) => c.id === "wica");
}
