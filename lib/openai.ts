// OpenAI API integration for receipt analysis
import OpenAI from 'openai';
import { ReceiptAnalysis, ReceiptItem } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeReceipt(imageBase64: string): Promise<ReceiptAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert at analyzing receipts and extracting items with prices. 
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
          - If quantity is not shown, default to 1
          - Use VND as default currency for Vietnamese receipts
          - Return only valid JSON, no additional text`,
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    const parsed = JSON.parse(content) as ReceiptAnalysis;
    
    // Ensure all items have IDs
    parsed.items = parsed.items.map((item, index) => ({
      ...item,
      id: item.id || `item-${index}`,
    }));

    return parsed;
  } catch (error) {
    console.error('Error analyzing receipt:', error);
    throw error;
  }
}



