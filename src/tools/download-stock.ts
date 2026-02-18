import { z } from "zod";
import { convertAndSave, buildAssetPath } from "../utils/image-converter.js";
import type { DownloadResult } from "../utils/types.js";

export const downloadStockSchema = z.object({
  url: z.string().url().describe("Download URL from search results"),
  filename: z
    .string()
    .regex(/^[a-zA-Z0-9_-]+$/, "Alphanumeric, hyphens, underscores only")
    .describe("Filename without extension"),
  credit: z.string().describe("Attribution string from search results"),
  download_tracking_url: z
    .string()
    .url()
    .optional()
    .describe("Unsplash download tracking URL (from search results)"),
  subdirectory: z
    .string()
    .regex(/^[a-zA-Z0-9_/-]*$/, "Alphanumeric, hyphens, underscores, slashes only")
    .refine((s) => !s.includes(".."), "Path traversal not allowed")
    .default("")
    .describe("Subfolder within src/assets/"),
});

type DownloadInput = z.infer<typeof downloadStockSchema>;

export async function handleDownloadStock(
  input: DownloadInput,
): Promise<DownloadResult> {
  const { url, filename, credit, download_tracking_url, subdirectory } = input;
  const projectRoot = process.env.PROJECT_ROOT;
  if (!projectRoot) throw new Error("PROJECT_ROOT not set");

  // Trigger Unsplash download tracking if provided
  if (download_tracking_url) {
    await fetch(download_tracking_url).catch(() => {});
  }

  // Download the image
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download image: ${res.status} ${res.statusText}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());

  // Build output path and convert to WebP
  const { outputPath, relativePath } = buildAssetPath(projectRoot, subdirectory, filename);
  const { width, height, file_size_bytes } = await convertAndSave(buffer, outputPath);

  return {
    file_path: relativePath,
    width,
    height,
    file_size_bytes,
    attribution_text: credit,
    attribution_html: credit.replace(
      /\((https?:\/\/[^)]+)\)/,
      '(<a href="$1" rel="noopener noreferrer" target="_blank">link</a>)',
    ),
  };
}
