import { describe, it, expect } from "vitest";
import { fnbProfileSchema } from "@/engine/schema";

describe("fnbProfileSchema validation", () => {
  const validProfile = {
    companyName: "Test Coffee",
    uen: "53312345X",
    businessType: "restaurant",
    contactEmail: "test@example.com",
    contactName: "John Doe",
    contactPhone: "91234567",
    additionalEmployees: 0,
    additionalSumInsured: 0,
    additionalPlLimit: 0,
    additionalPaPersons: 0,
    wicaRequired: false,
    wicaEmployees: [],
  };

  it("passes for a valid complete profile", () => {
    const result = fnbProfileSchema.safeParse(validProfile);
    expect(result.success).toBe(true);
  });

  it("fails for invalid UEN format", () => {
    const invalidProfile = { ...validProfile, uen: "12345" };
    const result = fnbProfileSchema.safeParse(invalidProfile);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("Invalid UEN format");
    }
  });

  it("fails for invalid Singapore mobile number", () => {
    const invalidProfile = { ...validProfile, contactPhone: "12345678" };
    const result = fnbProfileSchema.safeParse(invalidProfile);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("Invalid Singapore mobile");
    }
  });

  it("passes for valid Singapore mobile number starting with 8 or 9", () => {
    expect(fnbProfileSchema.safeParse({ ...validProfile, contactPhone: "81234567" }).success).toBe(true);
    expect(fnbProfileSchema.safeParse({ ...validProfile, contactPhone: "91234567" }).success).toBe(true);
  });

  it("fails for negative numeric values", () => {
    const invalidProfile = { ...validProfile, additionalEmployees: -1 };
    const result = fnbProfileSchema.safeParse(invalidProfile);
    expect(result.success).toBe(false);
  });
});
