import { describe, it, expect } from "vitest";
import { 
  toDollars, 
  toDollarsRounded, 
  toCents, 
  calculateGstCents, 
  withGst, 
  toPercentage 
} from "@/lib/formatters";

describe("Formatting Utilities", () => {
  describe("toDollars", () => {
    it("formats cents to S$ with 2 decimals", () => {
      expect(toDollars(150000)).toBe("S$1,500.00");
      expect(toDollars(0)).toBe("S$0.00");
      expect(toDollars(99)).toBe("S$0.99");
    });
  });

  describe("toDollarsRounded", () => {
    it("formats cents to S$ without decimals", () => {
      expect(toDollarsRounded(150050)).toBe("S$1,501");
      expect(toDollarsRounded(150049)).toBe("S$1,500");
      expect(toDollarsRounded(0)).toBe("S$0");
    });
  });

  describe("toCents", () => {
    it("converts dollars to cents", () => {
      expect(toCents(1500)).toBe(150000);
      expect(toCents(1500.55)).toBe(150055);
      expect(toCents(0.5)).toBe(50);
    });
  });

  describe("GST Calculations", () => {
    it("calculates 9% GST correctly", () => {
      expect(calculateGstCents(100000)).toBe(9000);
      expect(calculateGstCents(100)).toBe(9);
    });

    it("calculates total with GST", () => {
      expect(withGst(100000)).toBe(109000);
      expect(withGst(100)).toBe(109);
    });
  });

  describe("toPercentage", () => {
    it("formats decimal to percentage string", () => {
      expect(toPercentage(0.09)).toBe("9%");
      expect(toPercentage(0.09, 1)).toBe("9.0%");
      expect(toPercentage(0.1234, 2)).toBe("12.34%");
    });
  });
});
