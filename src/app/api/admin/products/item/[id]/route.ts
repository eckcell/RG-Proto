import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { configuration } = await request.json();

    if (!configuration) {
      return NextResponse.json({ error: "Configuration is required" }, { status: 400 });
    }

    // Optional: Deep validation with Zod could go here
    
    const updated = await prisma.product.update({
      where: { id },
      data: { configuration },
    });

    return NextResponse.json({ success: true, id: updated.id });
  } catch (error) {
    console.error("Product update error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}
