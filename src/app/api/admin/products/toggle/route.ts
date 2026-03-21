import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { productId, active } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: { active },
    });

    return NextResponse.json({ success: true, active: updated.active });
  } catch (error) {
    console.error("Product toggle error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}
