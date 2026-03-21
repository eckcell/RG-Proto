import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ industrySlug: string }> }
) {
  try {
    const { industrySlug } = await params;
    
    const template = await (prisma as any).formTemplate.findFirst({
      where: { 
        industry: { slug: industrySlug },
        active: true
      },
      include: { industry: true },
      orderBy: { updatedAt: 'desc' }
    });

    if (!template) {
      return NextResponse.json({ error: "No active template found for this industry" }, { status: 404 });
    }

    return NextResponse.json(template);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
