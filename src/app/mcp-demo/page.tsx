'use client';

import { useState } from 'react';
import { getMCPClient } from '@/lib/mcp-client';

export default function MCPDemo() {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [command, setCommand] = useState('');

  const handleExecuteCommand = async () => {
    if (!command.trim()) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      // Using the MCP client to execute a command
      const mcpClient = getMCPClient();
      const response = await mcpClient.executeTool(command, {});
      
      setResult(JSON.stringify(response, null, 2));
    } catch (error) {
      console.error('MCP execution error:', error);
      setResult(`Error: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Context7 MCP Demo</h1>
      
      <div className="mb-6">
        <label htmlFor="command" className="block text-sm font-medium text-gray-700 mb-2">
          Enter MCP Command
        </label>
        <input
          type="text"
          id="command"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., list-tools"
        />
        <button
          onClick={handleExecuteCommand}
          disabled={loading}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Executing...' : 'Execute Command'}
        </button>
      </div>

      {result && (
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h2 className="text-lg font-semibold mb-2">Response:</h2>
          <pre className="whitespace-pre-wrap break-words text-sm">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}