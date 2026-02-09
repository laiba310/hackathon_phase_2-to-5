/**
 * Context7 MCP Client
 * 
 * This module provides a client for communicating with the Context7 Model Context Protocol (MCP) server.
 * It allows the application to interact with external AI agents and services via the MCP standard.
 */

import { CONFIG } from './config';

interface MCPPayload {
  method: string;
  params?: any;
  id?: string;
}

interface MCPResponse {
  result?: any;
  error?: {
    code: number;
    message: string;
  };
  id?: string;
}

class MCPClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = CONFIG.mcp.context7.url;
    this.apiKey = CONFIG.mcp.context7.apiKey;
  }

  /**
   * Sends a request to the MCP server
   */
  async sendRequest(payload: MCPPayload): Promise<MCPResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('MCP request failed:', error);
      throw error;
    }
  }

  /**
   * Executes a tool on the MCP server
   */
  async executeTool(toolName: string, parameters: any): Promise<any> {
    const payload: MCPPayload = {
      method: 'tools/execute',
      params: {
        name: toolName,
        arguments: parameters,
      },
      id: `tool-${Date.now()}`,
    };

    const response = await this.sendRequest(payload);
    if (response.error) {
      throw new Error(`MCP tool execution failed: ${response.error.message}`);
    }

    return response.result;
  }

  /**
   * Gets available tools from the MCP server
   */
  async getAvailableTools(): Promise<any[]> {
    const payload: MCPPayload = {
      method: 'tools/list',
      id: `tools-${Date.now()}`,
    };

    const response = await this.sendRequest(payload);
    if (response.error) {
      throw new Error(`MCP tools listing failed: ${response.error.message}`);
    }

    return response.result?.tools || [];
  }
}

// Singleton instance
let mcpClient: MCPClient | null = null;

export const getMCPClient = (): MCPClient => {
  if (!mcpClient) {
    mcpClient = new MCPClient();
  }
  return mcpClient;
};

export default MCPClient;