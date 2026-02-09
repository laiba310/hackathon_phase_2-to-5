/**
 * Configuration module for the application
 *
 * This module exports a CONFIG object that contains all environment-specific settings,
 * including API URLs, keys, and other configuration values.
 *
 * NOTE: For server-side access to the settings file, use the mcp-server-actions.ts module.
 */

// Type definition for the configuration object
interface Config {
  mcp: {
    context7: {
      url: string;
      apiKey: string;
    };
  };
  auth: {
    baseUrl: string;
    secret: string;
  };
  api: {
    baseUrl: string;
  };
}

// Initialize configuration from environment variables
const initializeConfig = (): Config => {
  return {
    mcp: {
      context7: {
        url: process.env.NEXT_PUBLIC_CONTEXT7_MCP_URL || "https://mcp.context7.com/mcp",
        apiKey: process.env.CONTEXT7_API_KEY || "ctx7sk-d5280e0a-72dd-4db9-8488-79c5a17b5011",
      },
    },
    auth: {
      baseUrl: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
      secret: process.env.BETTER_AUTH_SECRET || "default-secret-for-development",
    },
    api: {
      baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://172.184.237.143:8000",
    },
  };
};

export const CONFIG = initializeConfig();

// Export default for backward compatibility if needed
export default CONFIG;