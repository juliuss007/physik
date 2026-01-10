# Physik Notiz-Tracker

Next.js 16 App-Router-Projekt für einen lokalen Notiz- und Prüfungs-Tracker im Physikstudium. Enthält Markdown/LaTeX-Rendering, PDF-Export, FullCalendar-Integration sowie lokale Persistenz in `localStorage`.

## Features
- Modul-Dashboard mit Glas-Optik (Tailwind CSS + shadcn/ui)
- Markdown-Editor mit Live-Vorschau (react-markdown + KaTeX)
- PDF-Export via LaTeX-Compilation (Server-API)
- FullCalendar (Monats- & Wochenansicht) mit festem Stundenplan und eigenen Prüfungen
- Backup/Restore von Notizen & Events (JSON), iCal-Export (.ics), Schriftgrößen-Umschalter
- Vollständig clientseitig, Statusverwaltung via Context + Reducer

## Erste Schritte
1. **Installieren**
   ```bash
   npm install
   ```
2. **Entwicklung starten**
   ```bash
   npm run dev
   ```
3. Projekt im Browser via `http://localhost:3000` öffnen.

> Hinweis: Die KaTeX-CSS wird direkt aus `katex/dist/katex.min.css` eingebunden.

## Skripte
- `npm run dev` – Entwicklung
- `npm run build` – Produktionsbuild
- `npm run start` – Build-Server starten
- `npm run lint` – ESLint (next/core-web-vitals)
- `node scripts/mcp-test.mjs` – MCP-Tools via Streamable HTTP testen

## MCP Server
- Entwicklungs-Setup: `npm run dev` starten und anschließend `node scripts/mcp-test.mjs http://localhost:3000/api/mcp` ausführen.
- Claude Desktop / Cursor via `mcp-remote` anbinden:
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
- Streamable HTTP steht unter `/api/mcp/mcp` bereit. Für SSE (`/api/mcp/sse`) muss `REDIS_URL` gesetzt sein (z. B. auf Vercel mit Upstash Redis).
- Die MCP-Tools sind stateless: Notizen/Event-Payloads werden vom Client übergeben, es erfolgt keine Serverspeicherung.

## Struktur
```
app/            # App Router Seiten (Dashboard, Notizen, Kalender, Settings)
components/     # UI-Komponenten (Glass Cards, Editor, Kalender, shadcn/ui)
lib/            # Module, Notes/Calendar/Settings-Contexts, Utilities
styles/         # Tailwind setup
public/         # Statische Assets
```

## Barrierefreiheit
- Semantische HTML-Struktur, Buttons/Labels mit `aria`-Attribute
- Tastaturbedienbare Dialoge (Radix/shadcn)
- Klare Kontraste durch dunkles Design + Glasmorphism-Highlights

## Lizenz
MIT
