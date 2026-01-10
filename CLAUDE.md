# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 14 App Router application for tracking physics study notes and exams. The app is **fully client-side** with local persistence using `localStorage`, featuring Markdown/LaTeX rendering, PDF export, and FullCalendar integration. All state is managed via React Context + Reducers.

## Development Commands

```bash
# Install dependencies
npm install

# Development server (localhost:3000)
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint with ESLint
npm run lint

# Test MCP tools via Streamable HTTP
node scripts/mcp-test.mjs http://localhost:3000/api/mcp
```

## Architecture

### State Management Pattern

The app uses a **Context + Reducer pattern** for all state management. There are three main state providers:

1. **NotesProvider** (`lib/notes/index.tsx`)
   - Manages all note CRUD operations
   - Automatically persists to `localStorage` key: `physik-notes`
   - Reducer actions: `create`, `update`, `delete`, `bulk-set`
   - Notes are auto-sorted by `updatedAt` (most recent first)

2. **CalendarProvider** (`lib/calendar/index.tsx`)
   - Manages calendar events (exams, special events)
   - Automatically persists to `localStorage` key: `physik-calendar-events`
   - Reducer actions: `create`, `update`, `delete`, `bulk-set`
   - Separated from static timetable data in `lib/calendar-data.ts`

3. **SettingsProvider** (`lib/settings/index.tsx`)
   - Manages global settings (currently just font scale: `sm`, `md`, `lg`)
   - Automatically persists to `localStorage` key: `physik-settings`
   - Sets `data-font-scale` attribute on `document.documentElement` for CSS

All three providers are composed in `app/providers.tsx` and wrapped around the app in `app/layout.tsx`.

### Storage Layer

`lib/storage.ts` provides the persistence abstraction:
- `loadFromStorage<T>()` - Load from localStorage with fallback
- `saveToStorage<T>()` - Save to localStorage (with in-memory fallback for SSR)
- `downloadJson()` / `downloadTextFile()` - Export utilities
- `readFileAsJson<T>()` - Import utilities

**Important**: All storage functions handle SSR gracefully by using an in-memory store when `window` is undefined.

### Module System

Physics modules are defined in `lib/modules.ts`:
- Type-safe `ModuleSlug` union type (defined in `types/app.d.ts`)
- Each module has: `slug`, `name`, `color`
- Provides maps: `MODULE_NAME_MAP`, `MODULE_COLOR_MAP`
- Current modules: `experimentalphysik-1`, `mathe-physiker-1`, `praktikum-exp-1`, `einfuehrungspraktikum`

**To add a new module:**
1. Add slug to `ModuleSlug` type in `types/app.d.ts`
2. Add entry to `MODULES` array in `lib/modules.ts`
3. Update `moduleEnum` in `lib/mcp/tools.ts` (line 17-22)

### Markdown + LaTeX Rendering

The app uses a unified pipeline for rendering:
- `react-markdown` for Markdown parsing
- `remark-gfm` for GitHub Flavored Markdown
- `remark-math` for LaTeX math parsing
- `rehype-katex` for LaTeX rendering
- `rehype-sanitize` for XSS protection

Pipeline is configured in:
- `components/NotePreview.tsx` - For note preview
- `lib/mcp/tools.ts` - For MCP tool rendering
- `lib/sanitize.ts` - Shared sanitization schema

**Note**: KaTeX CSS is imported from `katex/dist/katex.min.css` in `app/layout.tsx`.

### PDF Export

PDF generation uses the LaTeX pipeline (see `lib/markdownToLatex.ts`, `lib/latexTemplate.ts`, and `app/api/notes-to-pdf/route.ts`):
- Converts Markdown + LaTeX to a full TeX document
- Compiles via external LaTeX service
- Served as a downloadable PDF from the API route

### Calendar System

Two-layer calendar architecture:

1. **Static Timetable** (`lib/calendar-data.ts`)
   - Recurring weekly schedule defined in `TIMETABLE_DATA`
   - Function `expandTimetableToRange()` expands to date range
   - Events have `kind: "class"`

2. **User Events** (via CalendarProvider)
   - Custom exams/special events
   - Events have `kind: "exam" | "special"`
   - Can optionally link to a module

Calendar rendering in `components/CalendarView.tsx` merges both sources.

**iCal Export**: `lib/calendar/ics.ts` provides `generateICalendar()` function.

## MCP Server Integration

The project includes a Model Context Protocol (MCP) server for AI integration:

**Endpoint**: `/api/mcp/[transport]/route.ts`
- Supports two transports: `mcp` (Streamable HTTP) and `sse` (Server-Sent Events)
- SSE requires `REDIS_URL` environment variable (e.g., Upstash Redis on Vercel)
- All tools are **stateless** - notes/events must be passed in each call

**Available Tools** (`lib/mcp/tools.ts`):
- `render_math_markdown` - Render Markdown+LaTeX to sanitized HTML
- `list_modules` - Get all configured study modules
- `compile_timetable_range` - Expand static timetable to date range
- `validate_event` - Validate and normalize a calendar event
- `search_notes_in_payload` - Full-text search over provided notes array

**Resources**:
- `module://{slug}` - Get module details by slug
- `timetable://this-week` - Get current week's timetable with all classes

**Claude Desktop/Cursor Setup**:
```json
{
  "servers": {
    "phys-notes-mcp": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "http://localhost:3000/api/mcp"]
    }
  }
}
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui (Radix UI components)
- **Calendar**: FullCalendar (`@fullcalendar/react`)
- **Markdown**: react-markdown + unified ecosystem
- **Math**: KaTeX (via `rehype-katex`)
- **PDF**: LaTeX-based PDF export via API
- **Animations**: framer-motion
- **MCP**: `@modelcontextprotocol/sdk` + `mcp-handler`

## Project Structure

```
app/
  ├── layout.tsx              # Root layout with providers
  ├── providers.tsx           # Composed state providers
  ├── page.tsx                # Dashboard (module overview)
  ├── notes/
  │   ├── page.tsx            # Notes list
  │   └── [id]/page.tsx       # Note editor
  ├── calendar/page.tsx       # Calendar view
  ├── settings/page.tsx       # Settings page
  ├── admin/                  # Admin section
  │   ├── layout.tsx          # Admin layout wrapper
  │   └── page.tsx            # Backup/restore/export
  └── api/mcp/[transport]/route.ts  # MCP server endpoint

components/
  ├── ui/                     # shadcn/ui primitives
  ├── layout/                 # Layout components (Shell, MiniCalendar)
  ├── Card.tsx               # Main card component with sharp rectilinear design
  ├── NoteEditor.tsx         # Markdown editor
  ├── NotePreview.tsx        # Markdown+LaTeX preview
  ├── CalendarView.tsx       # FullCalendar integration
  ├── EventDialog.tsx        # Create/edit events
  ├── PdfExportButton.tsx    # PDF export trigger
  └── ...

lib/
  ├── notes/index.tsx        # NotesProvider + hooks
  ├── calendar/
  │   ├── index.tsx          # CalendarProvider + hooks
  │   └── ics.ts             # iCal export
  ├── settings/index.tsx     # SettingsProvider + hooks
  ├── modules.ts             # Module definitions
  ├── storage.ts             # localStorage abstraction
  ├── calendar-data.ts       # Static timetable
  ├── mcp/tools.ts           # MCP tool implementations
  ├── pdf.ts                 # PDF export logic
  ├── sanitize.ts            # Markdown sanitization schema
  └── utils.ts               # Utilities (generateId, cn, etc.)

types/
  └── app.d.ts               # Core TypeScript types
```

## Key Implementation Details

### Adding a New Note Feature

1. Update the `Note` interface in `types/app.d.ts` if adding fields
2. Update `createEmptyNote()` in `lib/notes/index.tsx` for defaults
3. Add reducer action if needed (e.g., for bulk operations)
4. Update `NoteEditor.tsx` and/or `NotePreview.tsx` for UI
5. Ensure backward compatibility with existing localStorage data

### Adding a Calendar Event Type

1. Add new kind to `CalendarEvent["kind"]` union in `types/app.d.ts`
2. Update `eventSchema` in `lib/mcp/tools.ts` for validation
3. Update event rendering logic in `components/CalendarView.tsx`
4. Consider color/styling in `lib/calendar-data.ts` or event-specific styles

### Modifying the Markdown Pipeline

All Markdown processing uses the same unified plugins. Modify in three places:
1. `components/NotePreview.tsx` (client-side preview)
2. `lib/mcp/tools.ts` (`render_math_markdown` tool)
3. `lib/sanitize.ts` (sanitization schema - be careful with XSS)

### Client-Side Only Operations

Many operations require browser APIs. Always use `isBrowser()` from `lib/utils.ts`:
```typescript
if (!isBrowser()) return;
```

This is critical for:
- `localStorage` access
- PDF generation
- File downloads
- Calendar rendering (uses FullCalendar)

## German Language

The app's UI and content are in **German** (physics study program context). Keep this in mind when:
- Writing user-facing strings
- Error messages
- Comments (code can be English, but UI strings should be German)
- Example content for notes/events
