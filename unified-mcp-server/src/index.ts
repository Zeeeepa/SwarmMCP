import dotenv from 'dotenv';
import { UnifiedMCPServer } from './core/UnifiedMCPServer';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

/**
 * Start the Unified MCP server
 */
async function startServer() {
  const server = new UnifiedMCPServer();

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    await server.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await server.stop();
    process.exit(0);
  });

  try {
    await server.start();
    logger.info(`Unified MCP Server started successfully`);
  } catch (error) {
    logger.error(`Failed to start Unified MCP Server: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

// Start the server
startServer();

