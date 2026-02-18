import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";

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
