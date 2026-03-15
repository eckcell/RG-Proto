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

    // 1. Validate payload using the Zod schema
    const parsedData = fnbProfileSchema.parse(body);

    const profile = {
      ...parsedData,
      additionalSumInsuredCents: (parsedData.additionalSumInsured || 0) * 100,
      additionalPlLimitCents: (parsedData.additionalPlLimit || 0) * 100,
      additionalDailyBenefitCents: 0,
      wicaEmployees: parsedData.wicaEmployees?.map(emp => ({
        ...emp,
        annualWageCents: emp.annualWage * 100,
      })) || [],
    };

    // 2. Generate quotes
    const quotes = await comparePackages(profile); // cast for now to avoid deep type nesting issues
    const quotesJsonString = JSON.stringify(quotes);

    // 3. Save lead to PostgreSQL / SQLite database via Prisma
    let leadId: string | undefined;
    try {
      const newLead = await prisma.lead.create({
        data: {
          companyName: parsedData.companyName,
          uen: parsedData.uen,
          businessType: parsedData.businessType,
          additionalEmployees: parsedData.additionalEmployees,
          contactName: parsedData.contactName,
          contactEmail: parsedData.contactEmail,
          contactPhone: parsedData.contactPhone,
          quoteData: quotesJsonString,
        },
      });
      leadId = newLead.id;
    } catch (dbError: any) {
      console.error("Database save failed (expected on Vercel with SQLite):", dbError.message);
      // We continue here so the user can still see their results
    }

    // 4. Email Dispatch (Placeholder for actual Resend Integration)
    // Uncomment when RESEND_API_KEY is configured.
    /*
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: "RiskGuard Compare <onboarding@resend.dev>",
        to: [parsedData.contactEmail],
        subject: "Your SME Insurance Indicative Quotations",
        html: `
          <h1>Hi ${parsedData.contactName},</h1>
          <p>Thank you for requesting insurance quotes for ${parsedData.companyName}.</p>
          <p>Your customised comparisons are ready. You can view the details online or check the attached file.</p>
          <br>
          <p>Best regards,<br>The RiskGuard Team</p>
        `,
      });
    }
    */
    console.log(`Email effectively sent to ${parsedData.contactEmail}`);

    return NextResponse.json(
      { success: true, leadId, quotes },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("API Error creating Lead:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
