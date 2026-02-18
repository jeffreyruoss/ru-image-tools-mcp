import { GoogleGenAI } from "@google/genai";
import type { AspectRatio } from "../utils/types.js";

interface GeminiImageResult {
  image_data: Buffer;
  mime_type: string;
}

export async function generateImage(
  prompt: string,
  model: string = "gemini-2.0-flash-preview-image-generation",
  aspectRatio?: AspectRatio,
): Promise<GeminiImageResult> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY not set");

  const ai = new GoogleGenAI({ apiKey: key });

  const config: Record<string, unknown> = {
    responseModalities: ["IMAGE"],
  };

  if (aspectRatio) {
    config.imageConfig = { aspectRatio };
  }

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config,
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) {
    throw new Error("No response from Gemini");
  }

  const imagePart = parts.find((p) => p.inlineData);
  if (!imagePart?.inlineData?.data) {
    throw new Error(
      "No image in Gemini response. The model may have returned text instead.",
    );
  }

  return {
    image_data: Buffer.from(imagePart.inlineData.data, "base64"),
    mime_type: imagePart.inlineData.mimeType || "image/png",
  };
}
