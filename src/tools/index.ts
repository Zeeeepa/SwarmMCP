import { FastMCP } from 'fastmcp';
import { registerEchoTool } from './echo-tool';
import logger from '../utils/logger';

/**
 * Register all built-in tools with the server
 * @param server - FastMCP server instance
 */
export function registerTools(server: FastMCP): void {
  try {
    logger.info('Registering built-in tools');
    
    // Register built-in tools
    registerEchoTool(server);
    
    logger.info('Built-in tools registered');
  } catch (error) {
    logger.error(`Failed to register tools: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

export * from './tool-interface';
export * from './echo-tool';

export default {
  registerTools,
};

