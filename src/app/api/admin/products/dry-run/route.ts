import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { calculatePackageQuote } from "@/engine/calculators/calculatePackage";
import { z } from "zod";

const insurerPackageSchema = z.object({
  insurerId: z.string(),
  productName: z.string(),
  tiers: z.array(z.any()),
  topUpRates: z.record(z.string(), z.any()),
  optionalCovers: z.array(z.any()),
  specialFeatures: z.array(z.string()),
  keyExclusions: z.array(z.string()),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

        const calc = calculatePackageQuote(pkg as any, tier, insurerName, "", mockProfile as any);
        return {
          leadId: lead.id,
          company: lead.companyName,
          success: calc.success,
          premium: calc.success ? calc.quote.totalPremiumCents : null,
          error: calc.success ? null : (calc as any).error
        };
      } catch (e: any) {
        return {
          leadId: lead.id,
          company: lead.companyName,
          success: false,
          error: e.message
        };
      }
    });

    const anyFailures = results.some(r => !r.success);

    return NextResponse.json({
      success: !anyFailures,
      results
    });

  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: "Invalid JSON configuration: " + error.message 
    }, { status: 400 });
  }
}
