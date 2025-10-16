/**
 * Simple HTTP test for MCP tools.
 * Usage: node scripts/mcp-test.mjs http://localhost:3000/api/mcp
 */
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const url = process.argv[2] || "http://localhost:3000/api/mcp";

const transport = new StreamableHTTPClientTransport(url);

try {
  const response = await transport.request({
    method: "tools/call",
    params: { name: "list_modules", arguments: {} }
  });
  console.log(JSON.stringify(response, null, 2));
} catch (error) {
  console.error(error);
} finally {
  transport.close();
}
