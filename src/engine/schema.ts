/**
 * RiskGuard Compare — F&B Business Profile Validation Schema
 *
 * Zod schemas for the bundled package quotation flow.
 * Validates the simplified F&B input form.
 */

import { z } from "zod";

// =============================================
// UEN Validation
// =============================================

/**
 * Singapore UEN format:
 * - Business (ROB): 8-9 digits + 1 uppercase letter (e.g., 53312345X)
 * - Local Company (ROC): T/S/R + 2 digits + 2 uppercase letters + 4 digits + 1 uppercase letter (e.g., T08LL1234A)
 */
const uenPattern = /^([0-9]{8,9}[A-Z]|[TSRP][0-9]{2}[A-Z]{2}[0-9]{4}[A-Z])$/;

// =============================================
// Step 1: Company Basics
// =============================================

export const companyBasicsSchema = z.object({
  companyName: z
    .string()
    .min(1, "Company name is required")
    .max(200, "Company name is too long"),
  uen: z
    .string()
    .regex(uenPattern, "Invalid UEN format"),
});

// =============================================
// Step 2: Business Type Selection
// =============================================

export const businessTypeSchema = z.object({
  businessType: z.enum(
    [
      "stall",
      "takeaway",
      "restaurant",
      "pub",
      "office",
      "retail",
      "fnb",
    ],
    { message: "Please select a business type" }
  ),
});

// =============================================
// Step 3: Coverage Customisation
// =============================================

export const coverageCustomisationSchema = z.object({
  /** Additional employees above base (for MSIG WICA top-up) */
  additionalEmployees: z
    .number()
    .int("Must be a whole number")
    .min(0, "Cannot be negative")
    .max(200, "Maximum 200 additional employees"),
  /** Additional fire/all-risks sum insured in dollars */
  additionalSumInsured: z
    .number()
    .min(0, "Cannot be negative")
    .max(5_000_000, "Maximum S$5,000,000"),
  /** Additional PL limit in dollars */
  additionalPlLimit: z
    .number()
    .min(0, "Cannot be negative")
    .max(5_000_000, "Maximum S$5,000,000"),
  /** Additional PA persons above base */
  additionalPaPersons: z
    .number()
    .int("Must be a whole number")
    .min(0, "Cannot be negative")
    .max(10, "Maximum 10 additional persons"),
});

// =============================================
// Step 4: WICA Add-On (Optional)
// =============================================

export const wicaEmployeeSchema = z.object({
  occupationClass: z.enum([
    "admin_management",
    "sales_purchasing",
    "kitchen_service_cashier",
    "driver_delivery",
    "non_manual_low",
    "non_manual_high",
    "manual_low",
    "manual_high",
  ]),
  annualWage: z
    .number()
    .min(0, "Cannot be negative")
    .max(200_000, "Maximum S$200,000"),
  headcount: z
    .number()
    .int("Must be a whole number")
    .min(1, "At least 1 employee")
    .max(200, "Maximum 200 employees"),
});

export const wicaAddonSchema = z.object({
  wicaRequired: z.boolean(),
  wicaEmployees: z.array(wicaEmployeeSchema).optional(),
});

// =============================================
// Step 4: Contact Information (Lead Capture)
// =============================================

export const contactDetailsSchema = z.object({
  contactName: z.string().min(1, "Name is required").min(2, "Name must be at least 2 characters"),
  contactEmail: z.string().email("Invalid email address"),
  contactPhone: z.string().regex(/^[89]\d{7}$/, "Invalid Singapore mobile number (starts with 8 or 9)"),
});

// =============================================
// Full F&B Profile Schema
// =============================================

export const fnbProfileSchema = companyBasicsSchema
  .merge(businessTypeSchema)
  .merge(coverageCustomisationSchema)
  .merge(wicaAddonSchema)
  .merge(contactDetailsSchema);

// =============================================
// Type Exports
// =============================================

export type CompanyBasicsInput = z.infer<typeof companyBasicsSchema>;
export type BusinessTypeInput = z.infer<typeof businessTypeSchema>;
export type CoverageCustomisationInput = z.infer<
  typeof coverageCustomisationSchema
>;
export type WicaEmployeeSchemaInput = z.infer<typeof wicaEmployeeSchema>;
export type WicaAddonInput = z.infer<typeof wicaAddonSchema>;
export type FnbProfileInput = z.infer<typeof fnbProfileSchema>;
