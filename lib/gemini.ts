// Google Gemini API integration for receipt analysis
import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { ReceiptAnalysis } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Get list of available models
async function getAvailableModels(): Promise<string[]> {
  try {
    // Try to list models via API
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return [];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    if (response.ok) {
      const data = await response.json();
      return (
        data.models?.map((m: { name?: string }) =>
          m.name?.replace("models/", "")
        ) || []
      );
    }
  } catch {
    console.log("Could not fetch available models, using defaults");
  }
  return [];
}

export async function analyzeReceipt(
  imageBase64: string,
  mimeType: string = "image/jpeg"
): Promise<ReceiptAnalysis> {
  // Try different models in order of preference
  const defaultModelNames = [
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash",
    "gemini-1.5-pro-latest",
    "gemini-1.5-pro",
    "gemini-pro-vision",
    "gemini-pro",
    "models/gemini-1.5-flash",
    "models/gemini-pro",
  ];

  // Try to get available models
  let availableModels: string[] = [];
  try {
    availableModels = await getAvailableModels();
    if (availableModels.length > 0) {
      console.log("Available models:", availableModels);
    }
  } catch {
    console.log("Could not fetch available models");
  }

  // Combine available models with defaults, prioritizing available ones
  const modelNames =
    availableModels.length > 0
      ? [...availableModels, ...defaultModelNames]
      : defaultModelNames;

  let lastError: Error | null = null;

  for (const modelName of modelNames) {
    try {
      // Remove 'models/' prefix if present
      const cleanModelName = modelName.replace(/^models\//, "");
      const model = genAI.getGenerativeModel({ model: cleanModelName });

      // Directly try to analyze - if it fails, we'll catch and try next
      return await analyzeWithModel(
        model,
        cleanModelName,
        imageBase64,
        mimeType
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.log(
        `Model ${modelName} failed: ${errorMessage.substring(
          0,
          100
        )}, trying next...`
      );
      lastError = error instanceof Error ? error : new Error(String(error));
      // Continue to next model
      continue;
    }
  }

  // If all models failed, throw a helpful error
  const errorMsg = lastError?.message || "Unknown error";
  throw new Error(
    `All Gemini models failed. Last error: ${errorMsg.substring(
      0,
      200
    )}. Please check your API key and ensure it has access to Gemini models. You may need to enable the Gemini API in Google Cloud Console.`
  );
}

async function analyzeWithModel(
  model: GenerativeModel,
  modelName: string,
  imageBase64: string,
  mimeType: string
): Promise<ReceiptAnalysis> {
  try {
    const prompt = `You are an expert at analyzing receipts and extracting items with prices. 
Return a JSON object with the following structure:
{
  "items": [
    {
      "id": "unique_id",
      "name": "item name",
      "price": 123.45,
      "quantity": 1
    }
  ],
  "total": 123.45,
  "currency": "VND"
}

Important:
- Extract all items from the receipt
- Convert prices to numbers (remove currency symbols)
- price should be the TOTAL price for that item (price * quantity), NOT unit price
- If quantity is not shown, default to 1
- Use VND as default currency for Vietnamese receipts
- The sum of all item prices should equal the total
- Return only valid JSON, no additional text or markdown formatting`;

    // Convert base64 to format Gemini expects
    // Support common image formats
    const supportedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    const finalMimeType = supportedMimeTypes.includes(mimeType)
      ? mimeType
      : "image/jpeg";

    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: finalMimeType,
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    console.log(
      `[Gemini] ${modelName} raw response (first 200 chars):`,
      text.slice(0, 200)
    );

    // Clean up the response (remove markdown code blocks if present)
    let cleanedText = text.trim();
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText
        .replace(/^```json\s*/, "")
        .replace(/\s*```$/, "");
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    let parsed: ReceiptAnalysis;
    try {
      parsed = JSON.parse(cleanedText) as ReceiptAnalysis;
    } catch (err) {
      console.error(
        "[Gemini] JSON parse error:",
        err,
        "cleanedText snippet:",
        cleanedText.slice(0, 200)
      );
      throw err;
    }

    // Ensure all items have IDs
    parsed.items = parsed.items.map((item, index) => ({
      ...item,
      id: item.id || `item-${index}`,
    }));

    return parsed;
  } catch (error) {
    console.error("Error analyzing receipt with Gemini:", error);
    throw error;
  }
}
