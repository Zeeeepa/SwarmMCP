import { ToolRegistry } from '../core/ToolRegistry';
import { AgentManager } from '../core/AgentManager';
import { TaskManager } from '../core/TaskManager';
import { ConfigManager } from '../core/ConfigManager';
import { logger } from '../utils/logger';
import { RESTAPIServer } from './rest/RESTAPIServer';
import { WebSocketAPIServer } from './websocket/WebSocketAPIServer';
import { CLIInterface } from './cli/CLIInterface';
import { MCPInterface } from './mcp/MCPInterface';

/**
 * Manager for all API interfaces in the unified MCP server
 */
export class APIManager {
  private toolRegistry: ToolRegistry;
  private agentManager: AgentManager;
  private taskManager: TaskManager;
  private configManager: ConfigManager;
  
  private restAPIServer?: RESTAPIServer;
  private webSocketAPIServer?: WebSocketAPIServer;
  private cliInterface?: CLIInterface;
  private mcpInterface?: MCPInterface;

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
   * Initialize all API interfaces
   */
  public async init(): Promise<void> {
    try {
      logger.info('Initializing API Manager...');
      
      // Initialize REST API if enabled
      if (this.configManager.get('api.rest.enabled', true)) {
        this.restAPIServer = new RESTAPIServer(
          this.toolRegistry,
          this.agentManager,
          this.taskManager,
          this.configManager
        );
        await this.restAPIServer.init();
      }
      
      // Initialize WebSocket API if enabled
      if (this.configManager.get('api.websocket.enabled', true)) {
        this.webSocketAPIServer = new WebSocketAPIServer(
          this.toolRegistry,
          this.agentManager,
          this.taskManager,
          this.configManager
        );
        await this.webSocketAPIServer.init();
      }
      
      // Initialize CLI interface if enabled
      if (this.configManager.get('api.cli.enabled', true)) {
        this.cliInterface = new CLIInterface(
          this.toolRegistry,
          this.agentManager,
          this.taskManager,
          this.configManager
        );
        await this.cliInterface.init();
      }
      
      // Initialize MCP interface if enabled
      if (this.configManager.get('api.mcp.enabled', true)) {
        this.mcpInterface = new MCPInterface(
          this.toolRegistry,
          this.agentManager,
          this.taskManager,
          this.configManager
        );
        await this.mcpInterface.init();
      }
      
      logger.info('API Manager initialized successfully');
    } catch (error) {
      logger.error(`Failed to initialize API Manager: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Start all API interfaces
   */
  public async start(): Promise<void> {
    try {
      logger.info('Starting API interfaces...');
      
      // Start REST API if initialized
      if (this.restAPIServer) {
        await this.restAPIServer.start();
      }
      
      // Start WebSocket API if initialized
      if (this.webSocketAPIServer) {
        await this.webSocketAPIServer.start();
      }
      
      // Start CLI interface if initialized
      if (this.cliInterface) {
        await this.cliInterface.start();
      }
      
      // Start MCP interface if initialized
      if (this.mcpInterface) {
        await this.mcpInterface.start();
      }
      
      logger.info('API interfaces started successfully');
    } catch (error) {
      logger.error(`Failed to start API interfaces: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Stop all API interfaces
   */
  public async stop(): Promise<void> {
    try {
      logger.info('Stopping API interfaces...');
      
      // Stop REST API if initialized
      if (this.restAPIServer) {
        await this.restAPIServer.stop();
      }
      
      // Stop WebSocket API if initialized
      if (this.webSocketAPIServer) {
        await this.webSocketAPIServer.stop();
      }
      
      // Stop CLI interface if initialized
      if (this.cliInterface) {
        await this.cliInterface.stop();
      }
      
      // Stop MCP interface if initialized
      if (this.mcpInterface) {
        await this.mcpInterface.stop();
      }
      
      logger.info('API interfaces stopped successfully');
    } catch (error) {
      logger.error(`Error stopping API interfaces: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}

