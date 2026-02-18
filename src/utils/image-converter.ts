import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";

interface ConvertResult {
  width: number;
  height: number;
  file_size_bytes: number;
}

/**
 * Convert image buffer to WebP and save to disk.
 */
export async function convertAndSave(
  input: Buffer,
  outputPath: string,
  quality: number = 80,
): Promise<ConvertResult> {
  await mkdir(dirname(outputPath), { recursive: true });

  const result = await sharp(input)
    .webp({ quality })
    .toFile(outputPath);

  return {
    width: result.width,
    height: result.height,
    file_size_bytes: result.size,
  };
}

/**
 * Build absolute output path and relative display path for an asset file.
 */
export function buildAssetPath(
  projectRoot: string,
  subdirectory: string,
  filename: string,
) {
  const assetsDir = join(projectRoot, "src", "assets");
  const outputDir = subdirectory ? join(assetsDir, subdirectory) : assetsDir;
  const outputPath = join(outputDir, `${filename}.webp`);
  const relativePath = subdirectory
    ? `src/assets/${subdirectory}/${filename}.webp`
    : `src/assets/${filename}.webp`;
  return { outputPath, relativePath };
}
