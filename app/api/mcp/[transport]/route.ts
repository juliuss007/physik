import { createMcpHandler } from "mcp-handler";
import { registerTools } from "@/lib/mcp/tools";

export const runtime = "nodejs";

interface RouteParams {
  transport: string;
}

const handler = async (
  req: Request,
  { params }: { params: Promise<RouteParams> | RouteParams }
) => {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { transport } = resolvedParams;
  const redisUrl = process.env.REDIS_URL;

  if (transport === "sse" && !redisUrl) {
    return new Response(
      JSON.stringify({ error: "REDIS_URL environment variable is required for SSE transport" }),
      {
        status: 503,
        headers: { "content-type": "application/json" }
      }
    );
  }

  const adapterOptions =
    transport === "sse"
      ? {
          basePath: "/api/mcp",
          verboseLogs: false,
          maxDuration: 60,
          redisUrl,
          disableSse: false
        }
      : {
          basePath: "/api/mcp",
          verboseLogs: false,
          maxDuration: 60,
          disableSse: true
        };

  return createMcpHandler(
    (server) => {
      // Tools + resources
      registerTools(server);
    },
    // server options (capabilities are inferred; add display names)
    {
      serverInfo: {
        name: "phys-notes-mcp",
        version: "1.0.0"
      },
      capabilities: {
        tools: {
          render_math_markdown: { description: "Render Markdown+LaTeX to sanitized HTML" },
          list_modules: { description: "List configured study modules" },
          compile_timetable_range: { description: "Expand static timetable into date range" },
          validate_event: { description: "Validate and normalize an event" },
          search_notes_in_payload: { description: "Search notes passed in the call" }
        }
      }
    },
    // adapter options
    adapterOptions
  )(req);
};

export { handler as GET, handler as POST };
