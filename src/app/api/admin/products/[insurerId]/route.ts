import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { insurerId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { insurerId } = params;

  const products = await prisma.product.findMany({
    where: { insurerId },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(products);
}

export async function POST(
  req: Request,
  { params }: { params: { insurerId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { insurerId } = params;
  const body = await req.json();

  try {
    const newProduct = await prisma.product.create({
      data: {
        insurerId,
        name: body.name,
        productCode: body.productCode,
        configuration: body.configuration, // Should be stringified JSON
        brochureUrl: body.brochureUrl,
        active: true,
      },
    });

    return NextResponse.json(newProduct);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
