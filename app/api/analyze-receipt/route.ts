// API route for analyzing receipt images
import { NextRequest, NextResponse } from 'next/server';
import { analyzeReceipt } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const mimeType = file.type || 'image/jpeg';

    // Analyze receipt
    const analysis = await analyzeReceipt(base64, mimeType);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error in analyze-receipt API:', error);
    return NextResponse.json(
      { error: 'Failed to analyze receipt', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

