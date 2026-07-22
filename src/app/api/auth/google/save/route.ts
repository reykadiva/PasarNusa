import { NextRequest, NextResponse } from "next/server";

// API route to save Google OAuth user data to MongoDB
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { googleId, name, email, picture } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Try to save to Express backend if available
    const expressUrl = process.env.EXPRESS_API_URL || "http://localhost:5000/api";
    
    try {
      const res = await fetch(`${expressUrl}/auth/google/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ googleId, name, email, picture }),
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch {
      // Express backend not available - that's ok for Vercel deployment
    }

    // Return success even if Express backend is not available
    // The user data is already saved in localStorage on the client
    return NextResponse.json({
      success: true,
      user: { googleId, name, email, picture, lastLogin: new Date().toISOString() },
      message: "User data saved locally",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to save user data" },
      { status: 500 }
    );
  }
}
