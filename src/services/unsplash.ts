import type { StockImageResult, StockSearchParams } from "../utils/types.js";

const BASE_URL = "https://api.unsplash.com";

interface UnsplashPhoto {
  id: string;
  width: number;
  height: number;
  urls: { thumb: string; small: string; raw: string };
  links: { download_location: string };
  user: { name: string; links: { html: string } };
}

interface UnsplashSearchResponse {
  results: UnsplashPhoto[];
}

export async function searchUnsplash(
  params: StockSearchParams,
): Promise<StockImageResult[]> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) throw new Error("UNSPLASH_ACCESS_KEY not set");

  const url = new URL(`${BASE_URL}/search/photos`);
  url.searchParams.set("client_id", key);
  url.searchParams.set("query", params.query);
  url.searchParams.set("per_page", String(params.count));

  if (params.orientation !== "any") {
    // Unsplash uses "squarish" instead of "square"
    const orientation =
      params.orientation === "square" ? "squarish" : params.orientation;
    url.searchParams.set("orientation", orientation);
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Unsplash API error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as UnsplashSearchResponse;

  return data.results.map((photo) => ({
    id: photo.id,
    source: "unsplash" as const,
    thumbnail_url: photo.urls.thumb,
    preview_url: photo.urls.small,
    download_url: `${photo.urls.raw}&w=2400&q=80`,
    width: photo.width,
    height: photo.height,
    photographer: photo.user.name,
    photographer_url: photo.user.links.html,
    attribution: `Photo by ${photo.user.name} on Unsplash (${photo.user.links.html})`,
    download_tracking_url: `${photo.links.download_location}?client_id=${key}`,
  }));
}
