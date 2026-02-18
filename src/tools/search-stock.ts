import { z } from "zod";
import { searchUnsplash } from "../services/unsplash.js";
import { searchPexels } from "../services/pexels.js";
import { searchPixabay } from "../services/pixabay.js";
import type {
  StockImageResult,
  StockSearchParams,
  Source,
  Orientation,
} from "../utils/types.js";

export const searchStockSchema = z.object({
  query: z.string().describe("Search terms for stock photos"),
  source: z
    .enum(["unsplash", "pexels", "pixabay", "all"])
    .default("all")
    .describe("Which service(s) to search"),
  count: z
    .number()
    .int()
    .min(1)
    .max(20)
    .default(5)
    .describe("Results per source (1-20)"),
  orientation: z
    .enum(["landscape", "portrait", "square", "any"])
    .default("any")
    .describe("Image orientation filter"),
});

type SearchInput = z.infer<typeof searchStockSchema>;

const serviceMap: Record<
  string,
  (params: StockSearchParams) => Promise<StockImageResult[]>
> = {
  unsplash: searchUnsplash,
  pexels: searchPexels,
  pixabay: searchPixabay,
};

export async function handleSearchStock(input: SearchInput) {
  const { query, source, count, orientation } = input;

  const sources: string[] =
    source === "all" ? ["unsplash", "pexels", "pixabay"] : [source];

  const results: StockImageResult[] = [];
  const sourcesSearched: string[] = [];
  const sourcesSkipped: { source: string; reason: string }[] = [];

  const searches = sources.map(async (src) => {
    const searchFn = serviceMap[src];
    if (!searchFn) return;

    try {
      const items = await searchFn({
        query,
        count,
        orientation: orientation as Orientation,
      });
      results.push(...items);
      sourcesSearched.push(src);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : String(err);
      if (message.includes("not set")) {
        sourcesSkipped.push({
          source: src,
          reason: "API key not configured",
        });
      } else {
        sourcesSkipped.push({ source: src, reason: message });
      }
    }
  });

  await Promise.all(searches);

  return {
    results,
    sources_searched: sourcesSearched,
    sources_skipped: sourcesSkipped,
    total_results: results.length,
  };
}
