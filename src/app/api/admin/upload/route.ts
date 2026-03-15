import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { optimizeAndSaveLogo } from "@/lib/image-utils";

export async function POST(req: Request) {
  /*
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  */

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const insurerId = formData.get("insurerId") as string;

    if (!file || !insurerId) {
      return NextResponse.json({ error: "Missing file or insurerId" }, { status: 400 });
    }

    const savedPath = await optimizeAndSaveLogo(file, insurerId);

    return NextResponse.json({ path: savedPath });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed: " + error.message }, { status: 500 });
  }
}
