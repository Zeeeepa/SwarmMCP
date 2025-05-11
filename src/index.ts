import dotenv from 'dotenv';
import { MCPServer } from './core/server';
import { registerTools } from './tools';
import logger from './utils/logger';

// Load environment variables
dotenv.config();

/**
 * Main entry point for the MCP server
 */
async function main() {
  try {
    // Create server with configuration from environment variables
    const server = new MCPServer({
      name: process.env.SERVER_NAME || 'Unified MCP Server',
      version: process.env.SERVER_VERSION || '0.1.0',
      description: process.env.SERVER_DESCRIPTION,
      port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
      host: process.env.HOST || 'localhost',
      transport: (process.env.TRANSPORT || 'http') as any,
      timeout: process.env.TIMEOUT ? parseInt(process.env.TIMEOUT, 10) : 60000,
      logLevel: (process.env.LOG_LEVEL || 'info') as any,
    });

    // Initialize server
    await server.init();

    // Register built-in tools
    registerTools(server.getFastMCPServer());

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('Received SIGINT signal');
      await server.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.info('Received SIGTERM signal');
      await server.stop();
      process.exit(0);
    });

    // Start server
    await server.start();

    return server;
  } catch (error) {
    logger.error(`Failed to start MCP server: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

// Run the server if this file is executed directly
if (require.main === module) {
  main();
}

// Export for programmatic usage
export { MCPServer };
export * from './core/server-config';
export * from './core/plugin-system';
export * from './core/resource-manager';
export * from './tools';
export * from './utils/error-handler';

export default main;

