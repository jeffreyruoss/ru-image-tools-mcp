import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  searchStockSchema,
  handleSearchStock,
} from "./tools/search-stock.js";
import {
  downloadStockSchema,
  handleDownloadStock,
} from "./tools/download-stock.js";
import {
  generateImageSchema,
  handleGenerateImage,
} from "./tools/generate-image.js";

const server = new McpServer({
  name: "image-tools",
  version: "1.0.0",
});

// --- search_stock_images ---
server.tool(
  "search_stock_images",
  "Search free stock photo services (Unsplash, Pexels, Pixabay) for images. Returns thumbnails, preview URLs, download URLs, and attribution info.",
  searchStockSchema.shape,
  async (params) => {
    try {
      const result = await handleSearchStock(params);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        content: [{ type: "text", text: `Error: ${message}` }],
        isError: true,
      };
    }
  },
);

// --- download_stock_image ---
server.tool(
  "download_stock_image",
  "Download a stock photo from search results, convert to WebP, and save to src/assets/. Requires the download URL and attribution from search results.",
  downloadStockSchema.shape,
  async (params) => {
    try {
      const result = await handleDownloadStock(params);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        content: [{ type: "text", text: `Error: ${message}` }],
        isError: true,
      };
    }
  },
);

// --- generate_image ---
server.tool(
  "generate_image",
  "Generate an image using Google Gemini AI, convert to WebP, and save to src/assets/.",
  generateImageSchema.shape,
  async (params) => {
    try {
      const result = await handleGenerateImage(params);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        content: [{ type: "text", text: `Error: ${message}` }],
        isError: true,
      };
    }
  },
);

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
