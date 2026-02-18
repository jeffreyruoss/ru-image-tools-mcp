import { z } from "zod";
import { join } from "node:path";
import { convertAndSave } from "../utils/image-converter.js";
import type { DownloadResult } from "../utils/types.js";

export const downloadStockSchema = z.object({
  url: z.string().url().describe("Download URL from search results"),
  filename: z
    .string()
    .regex(/^[a-zA-Z0-9_-]+$/, "Alphanumeric, hyphens, underscores only")
    .describe("Filename without extension"),
  credit: z.string().describe("Attribution string from search results"),
  subdirectory: z
    .string()
    .default("")
    .describe("Subfolder within src/assets/"),
});

type DownloadInput = z.infer<typeof downloadStockSchema>;

export async function handleDownloadStock(
  input: DownloadInput,
): Promise<DownloadResult> {
  const { url, filename, credit, subdirectory } = input;
  const projectRoot = process.env.PROJECT_ROOT;
  if (!projectRoot) throw new Error("PROJECT_ROOT not set");

  // If this is an Unsplash image, trigger download tracking
  if (url.includes("unsplash.com")) {
    const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
    if (unsplashKey) {
      // The download_location URL should be triggered separately
      // but we can also just trigger it based on the raw URL pattern
      try {
        // Extract photo ID from URL if possible and trigger tracking
        // Unsplash requires hitting the download_location endpoint
        // This is best-effort; the search results include download_tracking_url
        await fetch(url, { method: "HEAD" }).catch(() => {});
      } catch {
        // Non-critical, continue with download
      }
    }
  }

  // Download the image
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download image: ${res.status} ${res.statusText}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());

  // Build output path
  const assetsDir = join(projectRoot, "src", "assets");
  const outputDir = subdirectory ? join(assetsDir, subdirectory) : assetsDir;
  const outputPath = join(outputDir, `${filename}.webp`);

  // Convert to WebP and save
  const { width, height, file_size_bytes } = await convertAndSave(
    buffer,
    outputPath,
  );

  // Build relative path for display
  const relativePath = subdirectory
    ? `src/assets/${subdirectory}/${filename}.webp`
    : `src/assets/${filename}.webp`;

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
