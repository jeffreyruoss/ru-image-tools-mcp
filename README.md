# RU Image Fetcher

An MCP (Model Context Protocol) server that provides image search, download, and generation tools for Claude Code.

## Features

- **Search stock photos** across Unsplash, Pexels, and Pixabay
- **Download stock photos** with automatic WebP conversion via Sharp
- **Generate images** using Google Gemini

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and add your API keys:

   ```bash
   cp .env.example .env
   ```

3. Build:

   ```bash
   npm run build
   ```

## Configuration

Add the server to your project's `.mcp.json`:

```json
{
  "mcpServers": {
    "image-tools": {
      "command": "node",
      "args": ["path/to/image-tools/dist/index.js"],
      "env": {
        "PROJECT_ROOT": "."
      }
    }
  }
}
```

## API Keys

| Service   | Key                    | Sign up                              |
| --------- | ---------------------- | ------------------------------------ |
| Unsplash  | `UNSPLASH_ACCESS_KEY`  | https://unsplash.com/developers      |
| Pexels    | `PEXELS_API_KEY`       | https://www.pexels.com/api/          |
| Pixabay   | `PIXABAY_API_KEY`      | https://pixabay.com/api/docs/        |
| Gemini    | `GEMINI_API_KEY`       | https://aistudio.google.com/apikey   |

## Development

```bash
npm run dev    # Watch mode
npm run build  # One-time build
```
