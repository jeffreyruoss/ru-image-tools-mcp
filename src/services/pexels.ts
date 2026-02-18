import type { StockImageResult, StockSearchParams } from "../utils/types.js";

const BASE_URL = "https://api.pexels.com/v1";

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  photographer: string;
  photographer_url: string;
  src: { tiny: string; small: string; original: string };
}

interface PexelsSearchResponse {
  photos: PexelsPhoto[];
}

export async function searchPexels(
  params: StockSearchParams,
): Promise<StockImageResult[]> {
  const key = process.env.PEXELS_API_KEY;
  if (!key) throw new Error("PEXELS_API_KEY not set");

  const url = new URL(`${BASE_URL}/search`);
  url.searchParams.set("query", params.query);
  url.searchParams.set("per_page", String(params.count));

  if (params.orientation !== "any") {
    url.searchParams.set("orientation", params.orientation);
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: key },
  });
  if (!res.ok) {
    throw new Error(`Pexels API error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as PexelsSearchResponse;

  return data.photos.map((photo) => ({
    id: String(photo.id),
    source: "pexels" as const,
    thumbnail_url: photo.src.tiny,
    preview_url: photo.src.small,
    download_url: photo.src.original,
    width: photo.width,
    height: photo.height,
    photographer: photo.photographer,
    photographer_url: photo.photographer_url,
    attribution: `Photo by ${photo.photographer} on Pexels (${photo.photographer_url})`,
  }));
}
