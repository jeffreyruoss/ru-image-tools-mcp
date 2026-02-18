import { z } from "zod";
import { join } from "node:path";
import { generateImage } from "../services/gemini.js";
import { convertAndSave } from "../utils/image-converter.js";
import type { GenerateResult } from "../utils/types.js";

export const generateImageSchema = z.object({
  prompt: z.string().describe("Description of the image to generate"),
  filename: z
    .string()
    .regex(/^[a-zA-Z0-9_-]+$/, "Alphanumeric, hyphens, underscores only")
    .describe("Filename without extension"),
  model: z
    .enum([
      "gemini-2.0-flash-preview-image-generation",
      "gemini-2.5-flash-preview-image-generation",
    ])
    .default("gemini-2.0-flash-preview-image-generation")
    .describe("Gemini model for image generation"),
  aspect_ratio: z
    .enum(["1:1", "3:4", "4:3", "9:16", "16:9", "5:4"])
    .optional()
    .describe("Aspect ratio for the generated image"),
  subdirectory: z
    .string()
    .default("")
    .describe("Subfolder within src/assets/"),
});

type GenerateInput = z.infer<typeof generateImageSchema>;

export async function handleGenerateImage(
  input: GenerateInput,
): Promise<GenerateResult> {
  const { prompt, filename, model, aspect_ratio, subdirectory } = input;
  const projectRoot = process.env.PROJECT_ROOT;
  if (!projectRoot) throw new Error("PROJECT_ROOT not set");

  // Generate image via Gemini
  const { image_data } = await generateImage(prompt, model, aspect_ratio);

  // Build output path
  const assetsDir = join(projectRoot, "src", "assets");
  const outputDir = subdirectory ? join(assetsDir, subdirectory) : assetsDir;
  const outputPath = join(outputDir, `${filename}.webp`);

  // Convert to WebP and save
  const { width, height, file_size_bytes } = await convertAndSave(
    image_data,
    outputPath,
  );

  const relativePath = subdirectory
    ? `src/assets/${subdirectory}/${filename}.webp`
    : `src/assets/${filename}.webp`;

  return {
    file_path: relativePath,
    width,
    height,
    file_size_bytes,
  };
}
