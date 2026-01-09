import { createMcpHandler } from "mcp-handler";
import { registerTools } from "@/lib/mcp/tools";

export const runtime = "nodejs";

interface RouteParams {
  transport: string;
}

const handler = async (req: Request, { params }: { params: Promise<RouteParams> }) => {
  const { transport } = await params;
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
    // server options
    {
      serverInfo: {
        name: "phys-notes-mcp",
        version: "1.0.0"
      }
    },
    // adapter options
    adapterOptions
  )(req);
};

export { handler as GET, handler as POST };
