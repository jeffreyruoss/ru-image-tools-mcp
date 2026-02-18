# Image Tools MCP Server

An MCP (Model Context Protocol) server that provides image tools for Claude Code.

## Project Structure

- **`src/index.ts`** — MCP server entry point
- **`src/tools/`** — Tool implementations (search-stock, download-stock, generate-image)
- **`src/services/`** — API service clients (unsplash, pexels, pixabay, gemini)
- **`src/utils/`** — Shared types and image conversion utilities

## Stack

- TypeScript (ES2022, Node16 modules)
- `@modelcontextprotocol/sdk` — MCP server framework
- `sharp` — Image processing/conversion
- `@google/genai` — Gemini image generation
- `zod` — Schema validation

## Commands

- `npm run build` — Compile TypeScript to `dist/`
- `npm run dev` — Watch mode compilation

## Environment

- Requires API keys configured in `.env` (see `.env.example`)
- `PROJECT_ROOT` is set automatically via `.mcp.json` in the parent project
