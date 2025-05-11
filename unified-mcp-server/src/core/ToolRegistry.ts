import { FastMCP } from 'fastmcp';
import { logger } from '../utils/logger';

/**
 * Interface for tool definitions
 */
export interface Tool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  handler: (params: Record<string, any>) => Promise<any>;
}

/**
 * Registry for all tools available in the unified MCP server
 * Combines tools from both serv and SwarmMCP repositories
 */
export class ToolRegistry {
  private tools: Map<string, Tool> = new Map();
  private mcpServer: FastMCP;

  constructor(mcpServer: FastMCP) {
    this.mcpServer = mcpServer;
  }

  /**
   * Initialize the tool registry
   */
  public async init(): Promise<void> {
    try {
      logger.info('Initializing Tool Registry...');
      
      // Register core tools
      await this.registerCoreTools();
      
      // Register agent tools from serv
      await this.registerAgentTools();
      
      // Register task management tools from SwarmMCP
      await this.registerTaskManagementTools();
      
      logger.info(`Tool Registry initialized with ${this.tools.size} tools`);
    } catch (error) {
      logger.error(`Failed to initialize Tool Registry: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Register a new tool
   * @param tool - The tool to register
   */
  public registerTool(tool: Tool): void {
    if (this.tools.has(tool.name)) {
      logger.warn(`Tool with name '${tool.name}' already exists and will be overwritten`);
    }
    
    this.tools.set(tool.name, tool);
    
    // Register with MCP server
    this.mcpServer.addTool({
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
      handler: tool.handler
    });
    
    logger.debug(`Registered tool: ${tool.name}`);
  }

  /**
   * Get a tool by name
   * @param name - The name of the tool to get
   */
  public getTool(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  /**
   * Get all registered tools
   */
  public getAllTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Register core tools that are common to both systems
   */
  private async registerCoreTools(): Promise<void> {
    // Register common tools like file operations, bash execution, etc.
    this.registerTool({
      name: 'file_read',
      description: 'Read a file from the filesystem',
      parameters: {
        path: {
          type: 'string',
          description: 'Path to the file to read'
        }
      },
      handler: async (params) => {
        // Implementation will be added later
        return { content: '' };
      }
    });

    this.registerTool({
      name: 'file_write',
      description: 'Write content to a file',
      parameters: {
        path: {
          type: 'string',
          description: 'Path to the file to write'
        },
        content: {
          type: 'string',
          description: 'Content to write to the file'
        }
      },
      handler: async (params) => {
        // Implementation will be added later
        return { success: true };
      }
    });

    this.registerTool({
      name: 'bash_execute',
      description: 'Execute a bash command',
      parameters: {
        command: {
          type: 'string',
          description: 'Command to execute'
        }
      },
      handler: async (params) => {
        // Implementation will be added later
        return { output: '', exitCode: 0 };
      }
    });
  }

  /**
   * Register agent tools from serv
   */
  private async registerAgentTools(): Promise<void> {
    // Register agent-related tools from serv
    this.registerTool({
      name: 'agent_create',
      description: 'Create a new agent',
      parameters: {
        name: {
          type: 'string',
          description: 'Name of the agent'
        },
        config: {
          type: 'object',
          description: 'Agent configuration'
        }
      },
      handler: async (params) => {
        // Implementation will be added later
        return { agentId: 'agent-id' };
      }
    });

    this.registerTool({
      name: 'agent_run',
      description: 'Run an agent with a specific task',
      parameters: {
        agentId: {
          type: 'string',
          description: 'ID of the agent to run'
        },
        task: {
          type: 'string',
          description: 'Task for the agent to perform'
        }
      },
      handler: async (params) => {
        // Implementation will be added later
        return { result: {} };
      }
    });

    this.registerTool({
      name: 'checkpoint_create',
      description: 'Create a checkpoint of the current agent state',
      parameters: {
        agentId: {
          type: 'string',
          description: 'ID of the agent'
        }
      },
      handler: async (params) => {
        // Implementation will be added later
        return { checkpointId: 'checkpoint-id' };
      }
    });

    this.registerTool({
      name: 'checkpoint_restore',
      description: 'Restore an agent from a checkpoint',
      parameters: {
        checkpointId: {
          type: 'string',
          description: 'ID of the checkpoint to restore'
        }
      },
      handler: async (params) => {
        // Implementation will be added later
        return { agentId: 'agent-id' };
      }
    });
  }

  /**
   * Register task management tools from SwarmMCP
   */
  private async registerTaskManagementTools(): Promise<void> {
    // Register task management tools from SwarmMCP
    this.registerTool({
      name: 'task_create',
      description: 'Create a new task',
      parameters: {
        title: {
          type: 'string',
          description: 'Title of the task'
        },
        description: {
          type: 'string',
          description: 'Description of the task'
        }
      },
      handler: async (params) => {
        // Implementation will be added later
        return { taskId: 'task-id' };
      }
    });

    this.registerTool({
      name: 'task_update',
      description: 'Update an existing task',
      parameters: {
        taskId: {
          type: 'string',
          description: 'ID of the task to update'
        },
        updates: {
          type: 'object',
          description: 'Updates to apply to the task'
        }
      },
      handler: async (params) => {
        // Implementation will be added later
        return { success: true };
      }
    });

    this.registerTool({
      name: 'task_list',
      description: 'List all tasks',
      parameters: {
        filter: {
          type: 'object',
          description: 'Filter criteria for tasks'
        }
      },
      handler: async (params) => {
        // Implementation will be added later
        return { tasks: [] };
      }
    });

    this.registerTool({
      name: 'task_dependency_add',
      description: 'Add a dependency between tasks',
      parameters: {
        taskId: {
          type: 'string',
          description: 'ID of the dependent task'
        },
        dependsOnTaskId: {
          type: 'string',
          description: 'ID of the task that is depended on'
        }
      },
      handler: async (params) => {
        // Implementation will be added later
        return { success: true };
      }
    });
  }
}

