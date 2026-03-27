import { z } from "zod";
import { generateImage } from "../services/gemini.js";
import { convertAndSave, buildAssetPath } from "../utils/image-converter.js";
import type { GenerateResult } from "../utils/types.js";

export const generateImageSchema = z.object({
  prompt: z.string().describe("Description of the image to generate"),
  filename: z
    .string()
    .regex(/^[a-zA-Z0-9_-]+$/, "Alphanumeric, hyphens, underscores only")
    .describe("Filename without extension"),
  model: z
    .string()
    .default("gemini-2.5-flash-image")
    .describe("Gemini model for image generation"),
  aspect_ratio: z
    .enum(["1:1", "3:4", "4:3", "9:16", "16:9", "5:4"])
    .optional()
    .describe("Aspect ratio for the generated image"),
  subdirectory: z
    .string()
    .regex(/^[a-zA-Z0-9_/-]*$/, "Alphanumeric, hyphens, underscores, slashes only")
    .refine((s) => !s.includes(".."), "Path traversal not allowed")
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

  // Build output path and convert to WebP
  const { outputPath, relativePath } = buildAssetPath(projectRoot, subdirectory, filename);
  const { width, height, file_size_bytes } = await convertAndSave(image_data, outputPath);

  return {
    file_path: relativePath,
    width,
    height,
    file_size_bytes,
  };
}
