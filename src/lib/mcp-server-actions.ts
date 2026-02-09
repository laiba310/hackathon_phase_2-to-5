/**
 * Server Actions for MCP Integration
 * 
 * This module provides server-side functions to interact with the Context7 MCP server.
 * These functions can access the settings file directly on the server.
 */

import fs from 'fs';
import path from 'path';

// Define the settings structure
interface Settings {
  mcpServers: {
    context7: {
      type: string;
      url: string;
      headers: {
        CONTEXT7_API_KEY: string;
      };
    };
  };
}

/**
 * Reads the settings file from the project root
 */
export async function getSettings(): Promise<Settings> {
  try {
    // Construct the path to the settings file
    const settingsPath = path.join(process.cwd(), 'seetings.json');
    
    // Read the file
    const settingsData = fs.readFileSync(settingsPath, 'utf8');
    
    // Parse and return the settings
    return JSON.parse(settingsData);
  } catch (error) {
    console.error('Error reading settings file:', error);
    throw new Error('Failed to read settings file');
  }
}

/**
 * Gets Context7 MCP configuration from settings
 */
export async function getContext7Config() {
  const settings = await getSettings();
  return {
    url: settings.mcpServers.context7.url,
    apiKey: settings.mcpServers.context7.headers.CONTEXT7_API_KEY,
  };
}

/**
 * Executes an MCP command on the server side
 */
export async function executeMCPCommand<T = any>(method: string, params?: any): Promise<T> {
  const config = await getContext7Config();
  
  const response = await fetch(config.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      method,
      params,
      id: `req-${Date.now()}`,
    }),
  });

  if (!response.ok) {
    throw new Error(`MCP request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}