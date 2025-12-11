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

    console.log("[API] Parsing form data...");
    const formData = await request.formData();
    const file = formData.get("file") as File;

    console.log(
      "[API] File received:",
      file
        ? {
            name: file.name,
            size: file.size,
            type: file.type,
          }
        : "null"
    );

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const mimeType = file.type || "image/jpeg";

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
