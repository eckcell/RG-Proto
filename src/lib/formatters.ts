/**
 * RiskGuard Compare — Formatting Utilities
 *
 * Currency, percentage, and display formatting helpers.
 * All monetary values are stored in cents (integers) to avoid
 * floating-point precision issues.
 */

import { GST_RATE } from "@/engine/types";

/**
 * Convert cents to formatted Singapore dollar string.
 * @example toDollars(150000) → "S$1,500.00"
 */
export function toDollars(cents: number): string {
  const dollars = cents / 100;
  return `S$${dollars.toLocaleString("en-SG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Convert cents to formatted dollar string without decimals.
 * @example toDollarsRounded(150000) → "S$1,500"
 */
export function toDollarsRounded(cents: number): string {
  const dollars = Math.round(cents / 100);
  return `S$${dollars.toLocaleString("en-SG")}`;
}

/**
 * Convert dollar input (from form) to cents for storage.
 * @example toCents(1500) → 150000
 */
export function toCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Calculate GST amount in cents.
 * @example calculateGstCents(100000) → 9000
 */
export function calculateGstCents(premiumCents: number): number {
  return Math.round(premiumCents * GST_RATE);
}

/**
 * Calculate premium inclusive of GST in cents.
 * @example withGst(100000) → 109000
 */
export function withGst(premiumCents: number): number {
  return premiumCents + calculateGstCents(premiumCents);
}

/**
 * Format a number as a percentage string.
 * @example toPercentage(0.09) → "9%"
 * @example toPercentage(0.09, 1) → "9.0%"
 */
export function toPercentage(value: number, decimals: number = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format a number with thousand separators.
 * @example formatNumber(1500000) → "1,500,000"
 */
export function formatNumber(value: number): string {
  return value.toLocaleString("en-SG");
}
