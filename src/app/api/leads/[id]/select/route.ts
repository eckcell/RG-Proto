import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { insurerName, productName, totalPremiumCents } = await req.json();

    if (!insurerName || !productName) {
      return NextResponse.json(
        { success: false, message: "Missing selection details" },
        { status: 400 }
      );
    }

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        selectedInsurer: insurerName,
        selectedProduct: productName,
        selectedPremiumCents: totalPremiumCents,
        status: "INTERESTED",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Selection saved successfully",
      lead: updatedLead,
    });
  } catch (error: any) {
    console.error("Selection API Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
