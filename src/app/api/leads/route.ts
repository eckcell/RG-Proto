import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fnbProfileSchema } from "@/engine/schema";
import { comparePackages } from "@/engine/comparator";

// Note: Ensure RESEND_API_KEY is present in your environment variables.
// import { Resend } from "resend";
// const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { industrySlug, ...profileData } = body;

    // 1. Prepare profile for calculation (generic enough for now)
    const profile = {
      ...profileData,
      additionalSumInsuredCents: (profileData.additionalSumInsured || 0) * 100,
      additionalPlLimitCents: (profileData.additionalPlLimit || 0) * 100,
      wicaEmployees: profileData.wicaEmployees?.map((emp: any) => ({
        ...emp,
        annualWageCents: emp.annualWage * 100,
      })) || [],
    };

    // 2. Generate quotes based on industry
    const quotes = await comparePackages(profile, industrySlug || "fnb");
    const quotesJsonString = JSON.stringify(quotes);

    // 3. Save lead to database
    let leadId: string | undefined;
    try {
      const newLead = await (prisma as any).lead.create({
        data: {
          companyName: profileData.companyName || "Unknown",
          uen: profileData.uen || "N/A",
          businessType: profileData.businessType || "N/A",
          contactName: profileData.contactName || "Contact Requested",
          contactEmail: profileData.contactEmail || "",
          contactPhone: profileData.contactPhone || "",
          quoteData: quotesJsonString,
          profileData: JSON.stringify(profileData)
        },
      });
      leadId = newLead.id;
    } catch (dbError) {
      console.error("Database save failed:", dbError);
    }

    return NextResponse.json(
      { success: true, leadId, quotes },
      { status: 201 }
    );
  } catch (error) {
    console.error("API Error creating Lead:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
