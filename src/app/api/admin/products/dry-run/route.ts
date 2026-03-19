import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculatePackageQuote } from "@/engine/calculators/calculatePackage";
import { InsurerPackage, FnbBusinessProfile, PackageTier } from "@/engine/types";
import { z } from "zod";

const insurerPackageSchema = z.object({
  insurerId: z.string(),
  productName: z.string(),
  tiers: z.array(z.unknown()),
  topUpRates: z.record(z.string(), z.unknown()),
  optionalCovers: z.array(z.unknown()),
  specialFeatures: z.array(z.string()),
  keyExclusions: z.array(z.string()),
});

export async function POST(req: Request) {
  /*
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  */

  const { configuration, insurerName } = await req.json();

  try {
    // 1. Validate JSON structure
    const pkg = insurerPackageSchema.parse(configuration);

    // 2. Fetch last 5 leads for testing
    const testLeads = await prisma.lead.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    if (testLeads.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: "Validation passed, but no leads available for dry run simulation." 
      });
    }

    const results = testLeads.map((lead) => {
      try {
        const profile = JSON.parse(lead.quoteData).businessType; // Simplified profile proxy
        // In a real scenario, we'd reconstruct the full profile from lead fields
        // For this POC dry run, we'll just check if the tier exists
        const tier = pkg.tiers[0]; 
        
        // Mocking profile for dry-run if lead data is partial
        const mockProfile = {
          businessType: lead.businessType,
          additionalEmployees: lead.additionalEmployees || 0,
          additionalSumInsured: 0,
          additionalPlLimit: 0,
          wicaEmployees: [],
        };

        const calc = calculatePackageQuote(
          pkg as unknown as InsurerPackage, 
          tier as unknown as PackageTier, 
          insurerName, 
          "", 
          mockProfile as unknown as FnbBusinessProfile
        );
        
        return {
          leadId: lead.id,
          company: lead.companyName,
          success: calc.success,
          premium: calc.success ? calc.quote.totalPremiumCents : null,
          error: calc.success ? null : String(calc.error)
        };
      } catch (e) {
        const message = e instanceof Error ? e.message : "Calculation failed";
        return {
          leadId: lead.id,
          company: lead.companyName,
          success: false,
          error: message
        };
      }
    });

    const anyFailures = results.some(r => !r.success);

    return NextResponse.json({
      success: !anyFailures,
      results
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Dry-run validation error:", error.issues);
      return NextResponse.json({ 
        success: false, 
        error: "Schema validation failed: " + error.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`).join(', ')
      }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "An unexpected error occurred during dry run";
    console.error("Dry-run unexpected error:", error);
    return NextResponse.json({ 
      success: false, 
      error: message
    }, { status: 500 });
  }
}
