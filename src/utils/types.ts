export interface StockImageResult {
  id: string;
  source: "unsplash" | "pexels" | "pixabay";
  thumbnail_url: string;
  preview_url: string;
  download_url: string;
  width: number;
  height: number;
  photographer: string;
  photographer_url: string;
  attribution: string;
  /** Unsplash-specific: must be triggered when image is actually used */
  download_tracking_url?: string;
}

export interface SearchResults {
  results: StockImageResult[];
  sources_searched: string[];
  sources_skipped: { source: string; reason: string }[];
  total_results: number;
}

export interface DownloadResult {
  file_path: string;
  width: number;
  height: number;
  file_size_bytes: number;
  attribution_text: string;
  attribution_html: string;
}

export interface GenerateResult {
  file_path: string;
  width: number;
  height: number;
  file_size_bytes: number;
}

export type Orientation = "landscape" | "portrait" | "square" | "any";
export type Source = "unsplash" | "pexels" | "pixabay" | "all";
export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9" | "5:4";

export interface StockSearchParams {
  query: string;
  count: number;
  orientation: Orientation;
}
