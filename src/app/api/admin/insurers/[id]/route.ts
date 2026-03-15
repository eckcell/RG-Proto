import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  try {
    const updatedInsurer = await prisma.insurer.update({
      where: { id },
      data: {
        name: body.name,
        fullName: body.fullName,
        description: body.description,
        logoPath: body.logoPath,
        active: body.active,
      },
    });

    return NextResponse.json(updatedInsurer);
  } catch (error) {
    return NextResponse.json({ error: "Insurer not found" }, { status: 404 });
  }
}
