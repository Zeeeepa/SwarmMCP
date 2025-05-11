import { FastMCP } from 'fastmcp';
import { BaseTool } from './tool-interface';
import logger from '../utils/logger';

/**
 * Simple echo tool for testing
 */
export class EchoTool extends BaseTool {
  /**
   * Create a new echo tool
   */
  constructor() {
    super({
      name: 'echo',
      description: 'Echo the input message',
      parameters: {
        message: {
          type: 'string',
          description: 'Message to echo',
        },
      },
      returns: {
        message: {
          type: 'string',
          description: 'Echoed message',
        },
      },
    });
  }

  /**
   * Handle echo tool execution
   * @param params - Tool parameters
   * @returns Echoed message
   */
  handler(params: { message: string }): { message: string } {
    logger.debug(`Echo tool called with message: ${params.message}`);
    return { message: params.message };
  }
}

/**
 * Register the echo tool with the server
 * @param server - FastMCP server instance
 */
export function registerEchoTool(server: FastMCP): void {
  const echoTool = new EchoTool();
  echoTool.register(server);
  logger.info('Echo tool registered');
}

export default {
  EchoTool,
  registerEchoTool,
};

