import "dotenv/config";
import { expect, test, describe, beforeAll, afterAll } from "vitest";
import { ChildProcess, spawn } from "child_process";
import supertest from "supertest";

describe("MCP Server Endpoint", () => {
  let serverProcess: ChildProcess;
  let request: ReturnType<typeof supertest>;
  const PORT = 3001; // Use a different port for testing

  beforeAll(async () => {
    // Skip test if ALCHEMY_API_KEY is not set
    if (!process.env.ALCHEMY_API_KEY) {
      console.log("Skipping MCP server test - ALCHEMY_API_KEY not set");
      return;
    }

    // Start the server process
    serverProcess = spawn("tsx", ["src/app.ts"], {
      cwd: process.cwd(),
      env: { ...process.env, PORT: PORT.toString() },
    });

    // Wait for server to start
    await new Promise((resolve) => setTimeout(resolve, 3000));

    request = supertest(`http://localhost:${PORT}`);
  });

  afterAll(() => {
    if (serverProcess) {
      serverProcess.kill();
    }
  });

  test("should require x402 payment for MCP initialize request", async () => {
    // Skip test if ALCHEMY_API_KEY is not set
    if (!process.env.ALCHEMY_API_KEY) {
      return;
    }

    // Send an MCP initialize request without payment
    const initializeRequest = {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: {
          name: "test-client",
          version: "1.0.0",
        },
      },
    };

    const response = await request.post("/mcp").send(initializeRequest).expect(402);

    // Verify x402 payment required response
    expect(response.status).toBe(402);
    expect(response.body.accepts).toBeDefined();
    expect(response.body.accepts.scheme).toBe("exact");
  }, 30000);

  test("should require x402 payment for tools/list request", async () => {
    // Skip test if ALCHEMY_API_KEY is not set
    if (!process.env.ALCHEMY_API_KEY) {
      return;
    }

    // Send a tools/list request without payment
    const toolsListRequest = {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list",
      params: {},
    };

    const response = await request.post("/mcp").send(toolsListRequest).expect(402);

    // Verify x402 payment required response
    expect(response.status).toBe(402);
    expect(response.body.accepts).toBeDefined();
    expect(response.body.accepts.scheme).toBe("exact");
  }, 30000);
});
