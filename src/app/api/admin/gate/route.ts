import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const gatePassword = process.env.ADMIN_GATE_PASSWORD;

    if (!gatePassword) {
      // Gate is not active — should not normally reach here
      return NextResponse.json({ success: true });
    }

    if (password !== gatePassword) {
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 401 }
      );
    }

    // Password is correct — set an HTTP-only cookie for 14 days
    const response = NextResponse.json({ success: true });
    response.cookies.set("rg-admin-gate", "granted", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 14, // 14 days
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
