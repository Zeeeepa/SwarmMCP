import { ToolRegistry } from '../../core/ToolRegistry';
import { AgentManager } from '../../core/AgentManager';
import { TaskManager } from '../../core/TaskManager';
import { ConfigManager } from '../../core/ConfigManager';
import { logger } from '../../utils/logger';

/**
 * CLI interface for the unified MCP server
 */
export class CLIInterface {
  private toolRegistry: ToolRegistry;
  private agentManager: AgentManager;
  private taskManager: TaskManager;
  private configManager: ConfigManager;

  constructor(
    toolRegistry: ToolRegistry,
    agentManager: AgentManager,
    taskManager: TaskManager,
    configManager: ConfigManager
  ) {
    this.toolRegistry = toolRegistry;
    this.agentManager = agentManager;
    this.taskManager = taskManager;
    this.configManager = configManager;
  }

  /**
   * Initialize the CLI interface
   */
  public async init(): Promise<void> {
    try {
      logger.info('Initializing CLI interface...');
      
      // Register CLI-specific tools
      this.registerCLITools();
      
      logger.info('CLI interface initialized successfully');
    } catch (error) {
      logger.error(`Failed to initialize CLI interface: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Start the CLI interface
   */
  public async start(): Promise<void> {
    // CLI interface doesn't need to start a server
    logger.info('CLI interface ready');
    return Promise.resolve();
  }

  /**
   * Stop the CLI interface
   */
  public async stop(): Promise<void> {
    // CLI interface doesn't need to stop a server
    logger.info('CLI interface stopped');
    return Promise.resolve();
  }

  /**
   * Register CLI-specific tools
   */
  private registerCLITools(): void {
    // Register a tool for CLI help
    this.toolRegistry.registerTool({
      name: 'cli_help',
      description: 'Get help for CLI commands',
      parameters: {
        command: {
          type: 'string',
          description: 'Optional command to get help for',
          required: false
        }
      },
      handler: async (params) => {
        const command = params.command;
        
        if (command) {
          // Return help for a specific command
          return this.getCommandHelp(command);
        } else {
          // Return general help
          return this.getGeneralHelp();
        }
      }
    });

    // Register a tool for CLI command execution
    this.toolRegistry.registerTool({
      name: 'cli_execute',
      description: 'Execute a CLI command',
      parameters: {
        command: {
          type: 'string',
          description: 'Command to execute'
        },
        args: {
          type: 'object',
          description: 'Command arguments',
          required: false
        }
      },
      handler: async (params) => {
        return this.executeCommand(params.command, params.args || {});
      }
    });
  }

  /**
   * Get help for a specific command
   * @param command - The command to get help for
   */
  private getCommandHelp(command: string): any {
    // Define help for each command
    const commandHelp: Record<string, any> = {
      'agent': {
        description: 'Manage agents',
        subcommands: {
          'create': {
            description: 'Create a new agent',
            usage: 'agent create --name <name> [--description <description>] [--model <model>]',
            options: [
              { name: '--name', description: 'Name of the agent (required)' },
              { name: '--description', description: 'Description of the agent' },
              { name: '--model', description: 'Model to use for the agent' }
            ]
          },
          'list': {
            description: 'List all agents',
            usage: 'agent list [--filter <filter>]',
            options: [
              { name: '--filter', description: 'Filter criteria in JSON format' }
            ]
          },
          'get': {
            description: 'Get an agent by ID',
            usage: 'agent get --id <id>',
            options: [
              { name: '--id', description: 'ID of the agent (required)' }
            ]
          },
          'update': {
            description: 'Update an agent',
            usage: 'agent update --id <id> [--name <name>] [--description <description>] [--model <model>]',
            options: [
              { name: '--id', description: 'ID of the agent (required)' },
              { name: '--name', description: 'New name for the agent' },
              { name: '--description', description: 'New description for the agent' },
              { name: '--model', description: 'New model for the agent' }
            ]
          },
          'delete': {
            description: 'Delete an agent',
            usage: 'agent delete --id <id>',
            options: [
              { name: '--id', description: 'ID of the agent (required)' }
            ]
          },
          'run': {
            description: 'Run an agent with a task',
            usage: 'agent run --id <id> --task <task>',
            options: [
              { name: '--id', description: 'ID of the agent (required)' },
              { name: '--task', description: 'Task for the agent to perform (required)' }
            ]
          }
        }
      },
      'task': {
        description: 'Manage tasks',
        subcommands: {
          'create': {
            description: 'Create a new task',
            usage: 'task create --title <title> --description <description> [--dependencies <dependencies>]',
            options: [
              { name: '--title', description: 'Title of the task (required)' },
              { name: '--description', description: 'Description of the task (required)' },
              { name: '--dependencies', description: 'Comma-separated list of task IDs this task depends on' }
            ]
          },
          'list': {
            description: 'List all tasks',
            usage: 'task list [--filter <filter>]',
            options: [
              { name: '--filter', description: 'Filter criteria in JSON format' }
            ]
          },
          'get': {
            description: 'Get a task by ID',
            usage: 'task get --id <id>',
            options: [
              { name: '--id', description: 'ID of the task (required)' }
            ]
          },
          'update': {
            description: 'Update a task',
            usage: 'task update --id <id> [--title <title>] [--description <description>] [--status <status>]',
            options: [
              { name: '--id', description: 'ID of the task (required)' },
              { name: '--title', description: 'New title for the task' },
              { name: '--description', description: 'New description for the task' },
              { name: '--status', description: 'New status for the task (pending, in_progress, completed, failed, blocked)' }
            ]
          },
          'delete': {
            description: 'Delete a task',
            usage: 'task delete --id <id>',
            options: [
              { name: '--id', description: 'ID of the task (required)' }
            ]
          },
          'add-dependency': {
            description: 'Add a dependency between tasks',
            usage: 'task add-dependency --id <id> --depends-on <dependsOnId>',
            options: [
              { name: '--id', description: 'ID of the dependent task (required)' },
              { name: '--depends-on', description: 'ID of the task that is depended on (required)' }
            ]
          },
          'remove-dependency': {
            description: 'Remove a dependency between tasks',
            usage: 'task remove-dependency --id <id> --depends-on <dependsOnId>',
            options: [
              { name: '--id', description: 'ID of the dependent task (required)' },
              { name: '--depends-on', description: 'ID of the task that is depended on (required)' }
            ]
          },
          'next': {
            description: 'Get the next available task',
            usage: 'task next'
          }
        }
      },
      'tool': {
        description: 'Manage tools',
        subcommands: {
          'list': {
            description: 'List all available tools',
            usage: 'tool list'
          },
          'execute': {
            description: 'Execute a tool',
            usage: 'tool execute --name <name> [--parameters <parameters>]',
            options: [
              { name: '--name', description: 'Name of the tool to execute (required)' },
              { name: '--parameters', description: 'Parameters for the tool in JSON format' }
            ]
          }
        }
      },
      'help': {
        description: 'Get help for commands',
        usage: 'help [command]',
        options: [
          { name: 'command', description: 'Command to get help for' }
        ]
      }
    };
    
    // Return help for the requested command
    if (command in commandHelp) {
      return { success: true, help: commandHelp[command] };
    } else {
      return { 
        success: false, 
        error: `Command '${command}' not found. Available commands: ${Object.keys(commandHelp).join(', ')}` 
      };
    }
  }

  /**
   * Get general help for the CLI
   */
  private getGeneralHelp(): any {
    return {
      success: true,
      help: {
        description: 'Unified MCP Server CLI',
        version: this.configManager.getVersion(),
        usage: 'command [subcommand] [options]',
        commands: [
          { name: 'agent', description: 'Manage agents' },
          { name: 'task', description: 'Manage tasks' },
          { name: 'tool', description: 'Manage tools' },
          { name: 'help', description: 'Get help for commands' }
        ],
        examples: [
          { command: 'agent list', description: 'List all agents' },
          { command: 'task create --title "My Task" --description "Task description"', description: 'Create a new task' },
          { command: 'tool execute --name file_read --parameters {"path":"./example.txt"}', description: 'Execute a tool' },
          { command: 'help agent', description: 'Get help for the agent command' }
        ]
      }
    };
  }

  /**
   * Execute a CLI command
   * @param command - The command to execute
   * @param args - The command arguments
   */
  private async executeCommand(command: string, args: Record<string, any>): Promise<any> {
    try {
      // Parse the command
      const [mainCommand, subCommand] = command.split(' ');
      
      switch (mainCommand) {
        case 'agent':
          return this.executeAgentCommand(subCommand, args);
        case 'task':
          return this.executeTaskCommand(subCommand, args);
        case 'tool':
          return this.executeToolCommand(subCommand, args);
        case 'help':
          return this.getCommandHelp(args.command || '');
        default:
          return { 
            success: false, 
            error: `Unknown command: ${mainCommand}. Use 'help' to see available commands.` 
          };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  }

  /**
   * Execute an agent-related command
   * @param subCommand - The subcommand to execute
   * @param args - The command arguments
   */
  private async executeAgentCommand(subCommand: string, args: Record<string, any>): Promise<any> {
    switch (subCommand) {
      case 'create':
        if (!args.name) {
          return { success: false, error: 'Agent name is required' };
        }
        
        const agent = this.agentManager.createAgent({
          name: args.name,
          description: args.description,
          model: args.model
        });
        
        return { success: true, agent };
      
      case 'list':
        const agents = this.agentManager.listAgents(args.filter);
        return { success: true, agents };
      
      case 'get':
        if (!args.id) {
          return { success: false, error: 'Agent ID is required' };
        }
        
        const foundAgent = this.agentManager.getAgent(args.id);
        
        if (!foundAgent) {
          return { success: false, error: `Agent not found: ${args.id}` };
        }
        
        return { success: true, agent: foundAgent };
      
      case 'update':
        if (!args.id) {
          return { success: false, error: 'Agent ID is required' };
        }
        
        const updatedAgent = this.agentManager.updateAgent(args.id, {
          name: args.name,
          description: args.description,
          model: args.model
        });
        
        return { success: true, agent: updatedAgent };
      
      case 'delete':
        if (!args.id) {
          return { success: false, error: 'Agent ID is required' };
        }
        
        const deleteSuccess = this.agentManager.deleteAgent(args.id);
        return { success: deleteSuccess };
      
      case 'run':
        if (!args.id) {
          return { success: false, error: 'Agent ID is required' };
        }
        
        if (!args.task) {
          return { success: false, error: 'Task is required' };
        }
        
        const result = await this.agentManager.runAgent(args.id, args.task);
        return { success: true, result };
      
      default:
        return { 
          success: false, 
          error: `Unknown subcommand: ${subCommand}. Use 'help agent' to see available subcommands.` 
        };
    }
  }

  /**
   * Execute a task-related command
   * @param subCommand - The subcommand to execute
   * @param args - The command arguments
   */
  private async executeTaskCommand(subCommand: string, args: Record<string, any>): Promise<any> {
    switch (subCommand) {
      case 'create':
        if (!args.title) {
          return { success: false, error: 'Task title is required' };
        }
        
        if (!args.description) {
          return { success: false, error: 'Task description is required' };
        }
        
        const dependencies = args.dependencies ? args.dependencies.split(',') : [];
        
        const task = this.taskManager.createTask(
          args.title,
          args.description,
          dependencies
        );
        
        return { success: true, task };
      
      case 'list':
        const tasks = this.taskManager.listTasks(args.filter);
        return { success: true, tasks };
      
      case 'get':
        if (!args.id) {
          return { success: false, error: 'Task ID is required' };
        }
        
        const foundTask = this.taskManager.getTask(args.id);
        
        if (!foundTask) {
          return { success: false, error: `Task not found: ${args.id}` };
        }
        
        return { success: true, task: foundTask };
      
      case 'update':
        if (!args.id) {
          return { success: false, error: 'Task ID is required' };
        }
        
        const updates: Record<string, any> = {};
        
        if (args.title) updates.title = args.title;
        if (args.description) updates.description = args.description;
        if (args.status) updates.status = args.status;
        
        const updatedTask = this.taskManager.updateTask(args.id, updates);
        return { success: true, task: updatedTask };
      
      case 'delete':
        if (!args.id) {
          return { success: false, error: 'Task ID is required' };
        }
        
        const deleteSuccess = this.taskManager.deleteTask(args.id);
        return { success: deleteSuccess };
      
      case 'add-dependency':
        if (!args.id) {
          return { success: false, error: 'Task ID is required' };
        }
        
        if (!args['depends-on']) {
          return { success: false, error: 'Dependency task ID is required' };
        }
        
        const taskWithDependency = this.taskManager.addDependency(args.id, args['depends-on']);
        return { success: true, task: taskWithDependency };
      
      case 'remove-dependency':
        if (!args.id) {
          return { success: false, error: 'Task ID is required' };
        }
        
        if (!args['depends-on']) {
          return { success: false, error: 'Dependency task ID is required' };
        }
        
        const taskWithoutDependency = this.taskManager.removeDependency(args.id, args['depends-on']);
        return { success: true, task: taskWithoutDependency };
      
      case 'next':
        const nextTask = this.taskManager.getNextTask();
        return { success: true, task: nextTask };
      
      default:
        return { 
          success: false, 
          error: `Unknown subcommand: ${subCommand}. Use 'help task' to see available subcommands.` 
        };
    }
  }

  /**
   * Execute a tool-related command
   * @param subCommand - The subcommand to execute
   * @param args - The command arguments
   */
  private async executeToolCommand(subCommand: string, args: Record<string, any>): Promise<any> {
    switch (subCommand) {
      case 'list':
        const tools = this.toolRegistry.getAllTools();
        return { success: true, tools };
      
      case 'execute':
        if (!args.name) {
          return { success: false, error: 'Tool name is required' };
        }
        
        const tool = this.toolRegistry.getTool(args.name);
        
        if (!tool) {
          return { success: false, error: `Tool not found: ${args.name}` };
        }
        
        let parameters = {};
        
        if (args.parameters) {
          try {
            if (typeof args.parameters === 'string') {
              parameters = JSON.parse(args.parameters);
            } else {
              parameters = args.parameters;
            }
          } catch (error) {
            return { success: false, error: 'Invalid parameters format. Must be valid JSON.' };
          }
        }
        
        const result = await tool.handler(parameters);
        return { success: true, result };
      
      default:
        return { 
          success: false, 
          error: `Unknown subcommand: ${subCommand}. Use 'help tool' to see available subcommands.` 
        };
    }
  }
}

