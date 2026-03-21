import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split("\n");
    if (lines.length < 2) {
      return NextResponse.json({ error: "Empty or invalid CSV" }, { status: 400 });
    }

    // Basic CSV parser (assuming the format from Export)
    // ID, Insurer, Product Name, Product Code, Industry, Status, Configuration (JSON)
    const successCount = 0;
    const errors: string[] = [];

    // Skip header
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Simple regex to split CSV by comma while ignoring commas inside quotes
        const parts = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        if (!parts || parts.length < 7) continue;

        const id = parts[0].replace(/"/g, "");
        const configRaw = parts[6].replace(/^"/, "").replace(/"$/, "").replace(/""/g, '"');
        
        try {
            // Validate JSON
            JSON.parse(JSON.parse(configRaw)); // It was double stringified in export for CSV safety
            
            await (prisma as any).product.update({
                where: { id },
                data: {
                    configuration: JSON.parse(configRaw) // Store the actual JSON string
                }
            });
            (successCount as any)++;
        } catch (e) {
            errors.push(`Row ${i}: Invalid JSON or product not found`);
        }
    }

    return NextResponse.json({ 
        success: true, 
        message: `Successfully imported ${successCount} products`,
        errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error("Import Error:", error);
    return NextResponse.json({ error: "Failed to import products" }, { status: 500 });
  }
}
