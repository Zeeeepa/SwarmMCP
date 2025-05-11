import { FastMCP } from 'fastmcp';

/**
 * Interface for tool configuration
 */
export interface ToolConfig {
  name: string;
  description: string;
  parameters?: Record<string, any>;
  returns?: Record<string, any>;
  handler: (params: Record<string, any>) => Promise<any> | any;
}

/**
 * Interface for tool registration
 */
export interface ToolRegistration {
  register: (server: FastMCP) => void;
}

/**
 * Abstract base class for tools
 */
export abstract class BaseTool implements ToolRegistration {
  protected name: string;
  protected description: string;
  protected parameters?: Record<string, any>;
  protected returns?: Record<string, any>;

  /**
   * Create a new tool
   * @param config - Tool configuration
   */
  constructor(config: Omit<ToolConfig, 'handler'>) {
    this.name = config.name;
    this.description = config.description;
    this.parameters = config.parameters;
    this.returns = config.returns;
  }

  /**
   * Register the tool with the server
   * @param server - FastMCP server instance
   */
  register(server: FastMCP): void {
    server.addTool({
      name: this.name,
      description: this.description,
      parameters: this.parameters,
      returns: this.returns,
      handler: this.handler.bind(this),
    });
  }

  /**
   * Handle tool execution
   * @param params - Tool parameters
   */
  abstract handler(params: Record<string, any>): Promise<any> | any;
}

/**
 * Register a tool with the server
 * @param server - FastMCP server instance
 * @param tool - Tool configuration
 */
export function registerTool(server: FastMCP, tool: ToolConfig): void {
  server.addTool(tool);
}

export default {
  BaseTool,
  registerTool,
};

