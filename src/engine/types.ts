/**
 * RiskGuard Compare — Core Type Definitions
 *
 * All shared types for the insurance quotation engine.
 * This file must NEVER import React.
 *
 * v2 — Bundled F&B package model with 3 real insurers.
 */

// =============================================
// Constants
// =============================================

export const GST_RATE = 0.09;

// =============================================
// Business Profile Types
// =============================================

/** Risk categories mapped from SSIC codes */
export type RiskCategory = "low" | "medium" | "high" | "very_high";

/** Employee type classification for WICA */
export type EmployeeType = "manual" | "non_manual";

/** Foreign worker permit types (EP excluded from FWMI) */
export type WorkPermitType = "work_permit" | "s_pass";

// =============================================
// Insurer Types
// =============================================

export interface Insurer {
  id: string;
  name: string;
  fullName: string;
  address: string;
  phone: string;
  regNo: string;
  website: string;
  logoPath: string;
  productName: string;
  productCode: string;
  effectiveDate: string;
}

// =============================================
// F&B Bundled Package Model
// =============================================

/**
 * A bundle tier represents one plan level within an insurer's product.
 * E.g., MSIG has Office/Retail/F&B tiers; EQ has Stall/Take-Away/Restaurant.
 */
export interface PackageTier {
  id: string;
  name: string;
  description: string;
  /** Base premium in cents (inclusive of GST). null = quote on application */
  basePremiumCents: number | null;
  basePremiumNote?: string;
  /** Coverage items included in the base package. null = contact insurer */
  baseCoverage: Record<string, CoverageItem> | null;
}

/** A single coverage line item */
export interface CoverageItem {
  /** Sum insured / limit in cents */
  sumInsuredCents?: number;
  limitCents?: number | null;
  excessCents?: number;
  /** For BI / Consequential Loss — daily benefit */
  dailyBenefitCents?: number;
  maxDays?: number;
  /** For PA */
  persons?: number;
  deathCents?: number;
  medicalCents?: number;
  assaultCents?: number;
  /** For money */
  transitCents?: number;
  premisesCents?: number;
  /** Headcount (for bundled WICA) */
  headcount?: number;
  maxOutdoor?: number;
  /** Malicious damage excess */
  maliciousExcessPercent?: number;
  maliciousMinCents?: number;
  /** Human-readable description */
  description: string;
}

// ── Top-Up Rate Structures ──────────────────

/** Rate per increment — used for fire, PL, PA, WICA additional employees */
export interface IncrementTopUp {
  /** Rate per stated amount in cents, keyed by tier shorthand */
  [key: string]: unknown;
  description: string;
}

// ── Optional Cover ──────────────────────────

export interface OptionalCover {
  id: string;
  name: string;
  description: string;
  // Pricing varies per cover — modelled as optional fields
  maxSumInsuredCents?: number;
  ratePercent?: number;
  maxCents?: number;
  ratePer10000Cents?: Record<string, number>;
  perEmployeeCents?: number | Record<string, unknown>;
  perEmployeeMax?: number;
  aggregateRatePercent?: number;
  aggregateMaxCents?: number;
  /** WICA occupation-class rates (EQ format) */
  ratesByOccupation?: Record<string, WicaOccupationRate>;
  /** WICA wage-band rates (EQ Pub / Liberty format) */
  ratesByWageBand?: Record<string, WicaWageBandRate>;
  commonLawExtension?: number;
}

export interface WicaOccupationRate {
  ratePercent: number;
  description: string;
}

export interface WicaWageBandRate {
  wageMinCents?: number;
  wageMaxCents: number;
  perEmployeeCents: number;
  description: string;
}

// ── Full Insurer Package ────────────────────

export interface InsurerPackage {
  insurerId: string;
  productName: string;
  tiers: PackageTier[];
  topUpRates: Record<string, unknown>;
  optionalCovers: OptionalCover[];
  specialFeatures: string[];
  keyExclusions: string[];
}

// =============================================
// SSIC Code Types
// =============================================

export interface SsicCode {
  code: string;
  description: string;
  section: string;
  riskCategory: RiskCategory;
}

// =============================================
// Quote Input — F&B Bundled Model
// =============================================

/** Simplified F&B business profile for the bundled package flow */
export interface FnbBusinessProfile {
  companyName: string;
  uen: string;
  /** Business type determines tier: stall, takeaway, restaurant, pub, office, retail, fnb */
  businessType: string;
  /** Number of employees above the base included in the package */
  additionalEmployees: number;
  /** Additional fire/all-risks sum insured above base (in cents) */
  additionalSumInsuredCents: number;
  /** Additional PL limit above base (in cents) */
  additionalPlLimitCents: number;
  /** Additional PA persons above base */
  additionalPaPersons: number;
  /** Additional consequential-loss daily benefit above base (in cents) */
  additionalDailyBenefitCents: number;

  // WICA add-on inputs
  wicaRequired: boolean;
  wicaEmployees: WicaEmployeeInput[];
}

export interface WicaEmployeeInput {
  occupationClass: string;
  annualWageCents: number;
  headcount: number;
}

// =============================================
// Quote Result Types
// =============================================

export interface PackageQuoteResult {
  insurerId: string;
  insurerName: string;
  productName: string;
  tierId: string;
  tierName: string;
  /** Base premium in cents (inclusive of GST) */
  basePremiumCents: number;
  /** Top-up premiums itemised */
  topUpBreakdown: TopUpLineItem[];
  /** Total top-up in cents */
  totalTopUpCents: number;
  /** Optional covers added */
  optionalCoverBreakdown: TopUpLineItem[];
  /** Total optional cover in cents */
  totalOptionalCents: number;
  /** Grand total premium in cents (inclusive of GST) */
  totalPremiumCents: number;
  /** Coverage summary for comparison */
  coverageSummary: Record<string, string>;
  specialFeatures: string[];
  keyExclusions: string[];
  effectiveDate: string;
}

export interface TopUpLineItem {
  name: string;
  description: string;
  amountCents: number;
}

export interface QuoteError {
  code: string;
  message: string;
}

/** Discriminated union — calculators return this, never throw */
export type PackageCalculatorResult =
  | { success: true; quote: PackageQuoteResult }
  | { success: false; error: QuoteError };

// =============================================
// Comparison Result
// =============================================

export interface PackageComparison {
  businessType: string;
  quotes: PackageQuoteResult[];
  /** Sorted by totalPremiumCents ascending */
  sortedByPremium: PackageQuoteResult[];
}

// =============================================
// Rate Table Meta (legacy — kept for old rate files)
// =============================================

export interface RateTableMeta {
  version: string;
  lastUpdated: string;
  insuranceType: string;
}
