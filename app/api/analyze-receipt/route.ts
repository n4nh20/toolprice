// API route for analyzing receipt images
import { NextRequest, NextResponse } from "next/server";
import { analyzeReceipt } from "@/lib/gemini";

// Force Node.js runtime since we use Buffer and other Node APIs
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  console.log("[API] POST /api/analyze-receipt - Request received");
  console.log("[API] Request URL:", request.url);
  console.log("[API] Request method:", request.method);

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("[API] GEMINI_API_KEY exists:", !!apiKey);
    console.log("[API] GEMINI_API_KEY length:", apiKey?.length || 0);

    if (!apiKey) {
      console.error("[API] GEMINI_API_KEY is missing in environment");
      return NextResponse.json(
        { error: "Server missing GEMINI_API_KEY" },
        { status: 500 }
      );
    }

    console.log("[API] Parsing request body...");
    const body = await request.json();
    const { image: base64, mimeType } = body;

    console.log("[API] Image data received:", {
      base64Length: base64?.length || 0,
      mimeType: mimeType || "not provided",
    });

    if (!base64) {
      return NextResponse.json(
        { error: "No image data provided" },
        { status: 400 }
      );
    }

    // Analyze receipt
    console.log("[API] Calling analyzeReceipt...");
    const analysis = await analyzeReceipt(base64, mimeType);
    console.log("[API] Analysis completed successfully");

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("[API] Error in analyze-receipt API:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error from Gemini";
    console.error("[API] Error message:", message);
    return NextResponse.json(
      {
        error: "Failed to analyze receipt",
        details: message,
      },
      { status: 500 }
    );
  }
}
