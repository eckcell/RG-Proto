import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  /*
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  */

  const insurers = await prisma.insurer.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json(insurers);
}

export async function POST(req: Request) {
  /*
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  */

  const body = await req.json();

  try {
    const newInsurer = await prisma.insurer.create({
      data: {
        name: body.name,
        fullName: body.fullName,
        logoPath: body.logoPath,
        description: body.description,
        active: true,
      },
    });

    return NextResponse.json(newInsurer);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create insurer" }, { status: 500 });
  }
}
