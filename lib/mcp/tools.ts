import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";

import { MODULES } from "@/lib/modules";
import { TIMETABLE, expandTimetableToRange } from "@/lib/calendar-data";
import type { CalendarEvent, ModuleSlug, Note } from "@/types/app";
import { markdownSanitizeSchema } from "@/lib/sanitize";

const moduleEnum = z.enum([
  "experimentalphysik-1",
  "mathe-physiker-1",
  "praktikum-exp-1",
  "einfuehrungspraktikum"
]);

const noteSchema = z.object({
  id: z.string(),
  title: z.string(),
  module: moduleEnum,
  tags: z.array(z.string()),
  content: z.string(),
  updatedAt: z.string(),
  createdAt: z.string()
});

const eventSchema = z.object({
  title: z.string().min(1),
  start: z.string().datetime(),
  end: z.string().datetime().optional(),
  allDay: z.boolean().optional(),
  module: moduleEnum.optional(),
  kind: z.enum(["exam", "special"]),
  description: z.string().optional()
});

const sanitizeSchema = structuredClone(markdownSanitizeSchema);

export function registerTools(server: McpServer) {
  server.tool(
    "render_math_markdown",
    "Render Markdown + LaTeX ($ ... $ / $$ ... $$) into sanitized HTML",
    z.object({ markdown: z.string().min(1) }),
    async ({ markdown }) => {
      const file = await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkMath)
        .use(rehypeRaw)
        .use(rehypeKatex)
        .use(rehypeSanitize, sanitizeSchema)
        .use(rehypeStringify)
        .process(markdown);

      const html = String(file);
      return {
        content: [{ type: "text", text: html }],
        structuredContent: { html }
      };
    }
  );

  server.tool(
    "list_modules",
    "List configured modules",
    z.object({}).optional(),
    async () => {
      return {
        content: [{ type: "json", json: MODULES }],
        structuredContent: { modules: MODULES }
      };
    }
  );

  server.tool(
    "compile_timetable_range",
    "Expand static timetable into a date range",
    z.object({
      startISO: z.string().datetime(),
      endISO: z.string().datetime()
    }),
    async ({ startISO, endISO }) => {
      const events = expandTimetableToRange(startISO, endISO).filter((event) => event.kind === "class");
      return {
        content: [{ type: "json", json: events }],
        structuredContent: { events }
      };
    }
  );

  server.tool(
    "validate_event",
    "Validate and normalize an event (returns id)",
    eventSchema,
    async (args) => {
      const startTime = new Date(args.start).getTime();
      const endTime = args.end ? new Date(args.end).getTime() : undefined;

      if (Number.isNaN(startTime)) {
        const error = "Ungültiges Startdatum";
        return {
          content: [{ type: "text", text: error }],
          structuredContent: { ok: false as const, error }
        };
      }

      if (endTime !== undefined && Number.isNaN(endTime)) {
        const error = "Ungültiges Enddatum";
        return {
          content: [{ type: "text", text: error }],
          structuredContent: { ok: false as const, error }
        };
      }

      if (endTime !== undefined && endTime < startTime) {
        const error = "Ende liegt vor dem Start";
        return {
          content: [{ type: "text", text: error }],
          structuredContent: { ok: false as const, error }
        };
      }

      const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `event-${Math.random().toString(36).slice(2)}`;
      const event: CalendarEvent = {
        id,
        title: args.title,
        start: new Date(startTime).toISOString(),
        end: endTime !== undefined ? new Date(endTime).toISOString() : undefined,
        allDay: args.allDay,
        module: args.module,
        kind: args.kind,
        description: args.description
      };

      return {
        content: [{ type: "json", json: { ok: true, event } }],
        structuredContent: { ok: true as const, event }
      };
    }
  );

  server.tool(
    "search_notes_in_payload",
    "Fulltext search over provided notes array",
    z.object({
      notes: z.array(noteSchema),
      query: z.string().min(1)
    }),
    async ({ notes, query }) => {
      const normalized = query.trim().toLowerCase();
      const hits = (notes as Note[]).filter((note) => {
        return (
          note.title.toLowerCase().includes(normalized) ||
          note.content.toLowerCase().includes(normalized) ||
          note.tags.some((tag) => tag.toLowerCase().includes(normalized))
        );
      });

      return {
        content: [{ type: "json", json: hits }],
        structuredContent: { hits }
      };
    }
  );

  server.resource(
    "module://{slug}",
    {
      list: async () =>
        MODULES.map((entry) => ({
          uri: `module://${entry.slug}`,
          mimeType: "application/json"
        }))
    },
    async ({ slug }) => {
      const foundModule = MODULES.find((item) => item.slug === slug);

      if (!foundModule) {
        return {
          contents: [
            {
              uri: `module://${slug}`,
              text: "Module not found",
              mimeType: "text/plain"
            }
          ]
        };
      }

      return {
        contents: [
          {
            uri: `module://${foundModule.slug}`,
            text: JSON.stringify(foundModule),
            mimeType: "application/json"
          }
        ]
      };
    }
  );

  server.resource(
    "timetable://this-week",
    {
      list: async () => [
        {
          uri: "timetable://this-week",
          mimeType: "application/json"
        }
      ]
    },
    async () => {
      const now = new Date();
      const day = now.getUTCDay();
      const diffToMonday = day === 0 ? -6 : 1 - day;

      const monday = new Date(now);
      monday.setUTCHours(0, 0, 0, 0);
      monday.setUTCDate(monday.getUTCDate() + diffToMonday);

      const sunday = new Date(monday);
      sunday.setUTCDate(sunday.getUTCDate() + 6);
      sunday.setUTCHours(23, 59, 59, 999);

      const events = expandTimetableToRange(monday.toISOString(), sunday.toISOString());

      return {
        contents: [
          {
            uri: "timetable://this-week",
            text: JSON.stringify({
              range: {
                start: monday.toISOString(),
                end: sunday.toISOString()
              },
              modules: MODULES,
              timetable: TIMETABLE,
              events,
              source: "static-timetable"
            }),
            mimeType: "application/json"
          }
        ]
      };
    }
  );
}
