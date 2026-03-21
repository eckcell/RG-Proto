import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const products = await (prisma as any).product.findMany({
      include: {
        insurer: true,
        industry: true
      }
    });

    const headers = ["ID", "Insurer", "Product Name", "Product Code", "Industry", "Status", "Configuration (JSON)"];
    const rows = products.map((p: any) => [
      p.id,
      p.insurer?.name || "",
      p.name,
      p.productCode,
      p.industry?.name || "",
      p.active ? "Active" : "Inactive",
      // Escape quotes in JSON for CSV safety
      JSON.stringify(p.configuration).replace(/"/g, '""')
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r: string[]) => `"${r.join('","')}"`)
    ].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="riskguard_products_${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error) {
    console.error("Export Error:", error);
    return NextResponse.json({ error: "Failed to export products" }, { status: 500 });
  }
}
