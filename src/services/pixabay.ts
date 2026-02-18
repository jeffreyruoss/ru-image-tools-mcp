import type { StockImageResult, StockSearchParams } from "../utils/types.js";

const BASE_URL = "https://pixabay.com/api/";

interface PixabayHit {
  id: number;
  previewURL: string;
  webformatURL: string;
  largeImageURL: string;
  imageWidth: number;
  imageHeight: number;
  user: string;
  userImageURL: string;
  pageURL: string;
}

interface PixabaySearchResponse {
  hits: PixabayHit[];
}

export async function searchPixabay(
  params: StockSearchParams,
): Promise<StockImageResult[]> {
  const key = process.env.PIXABAY_API_KEY;
  if (!key) throw new Error("PIXABAY_API_KEY not set");

  const url = new URL(BASE_URL);
  url.searchParams.set("key", key);
  url.searchParams.set("q", params.query);
  url.searchParams.set("per_page", String(params.count));
  url.searchParams.set("image_type", "photo");
  url.searchParams.set("safesearch", "true");

  if (params.orientation !== "any") {
    // Pixabay uses "horizontal"/"vertical" instead of "landscape"/"portrait"
    const orientationMap: Record<string, string> = {
      landscape: "horizontal",
      portrait: "vertical",
      square: "square",  // not documented but works as filter
    };
    const mapped = orientationMap[params.orientation];
    if (mapped) {
      url.searchParams.set("orientation", mapped);
    }
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Pixabay API error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as PixabaySearchResponse;

  return data.hits.map((hit) => ({
    id: String(hit.id),
    source: "pixabay" as const,
    thumbnail_url: hit.previewURL,
    preview_url: hit.webformatURL,
    download_url: hit.largeImageURL,
    width: hit.imageWidth,
    height: hit.imageHeight,
    photographer: hit.user,
    photographer_url: hit.pageURL,
    attribution: `Image by ${hit.user} on Pixabay (${hit.pageURL})`,
  }));
}
