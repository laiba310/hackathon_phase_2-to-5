import { getMCPClient } from '@/lib/mcp-client';

/**
 * Context7 MCP Integration Service
 * 
 * This module provides functions to integrate Context7 MCP capabilities
 * with the existing authentication and business logic of the application.
 */

export class MCPIntegrationService {
  private mcpClient = getMCPClient();

  /**
   * Executes a task through the Context7 MCP
   * 
   * @param taskId - The unique identifier for the task
   * @param params - Parameters for the task
   * @returns Promise resolving to the task result
   */
  async executeTask(taskId: string, params: Record<string, any> = {}): Promise<any> {
    try {
      console.log(`Executing task ${taskId} via MCP with params:`, params);
      const result = await this.mcpClient.executeTool(taskId, params);
      console.log(`Task ${taskId} completed with result:`, result);
      return result;
    } catch (error) {
      console.error(`Failed to execute task ${taskId} via MCP:`, error);
      throw error;
    }
  }

  /**
   * Gets available tools from the Context7 MCP server
   */
  async getAvailableTools(): Promise<any[]> {
    try {
      const tools = await this.mcpClient.getAvailableTools();
      console.log('Available MCP tools:', tools);
      return tools;
    } catch (error) {
      console.error('Failed to get available tools from MCP:', error);
      throw error;
    }
  }

  /**
   * Performs an intelligent text analysis through MCP
   */
  async analyzeText(content: string): Promise<any> {
    return this.executeTask('text-analysis', { content });
  }

  /**
   * Performs code review through MCP
   */
  async reviewCode(code: string, language: string = 'typescript'): Promise<any> {
    return this.executeTask('code-review', { code, language });
  }

  /**
   * Generates documentation through MCP
   */
  async generateDocumentation(code: string, language: string = 'typescript'): Promise<any> {
    return this.executeTask('documentation-generation', { code, language });
  }
}

// Singleton instance
export const mcpService = new MCPIntegrationService();

export default mcpService;