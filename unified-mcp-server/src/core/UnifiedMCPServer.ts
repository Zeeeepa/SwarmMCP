import { FastMCP } from 'fastmcp';
import { logger } from '../utils/logger';
import { APIManager } from '../api/APIManager';
import { IntegrationManager } from '../integrations/IntegrationManager';
import { ToolRegistry } from './ToolRegistry';
import { AgentManager } from './AgentManager';
import { TaskManager } from './TaskManager';
import { ConfigManager } from './ConfigManager';

/**
 * Main class for the Unified MCP Server
 * Combines functionality from serv and SwarmMCP repositories
 */
export class UnifiedMCPServer {
  private mcpServer: FastMCP;
  private apiManager: APIManager;
  private integrationManager: IntegrationManager;
  private toolRegistry: ToolRegistry;
  private agentManager: AgentManager;
  private taskManager: TaskManager;
  private configManager: ConfigManager;
  private initialized: boolean = false;

  constructor() {
    // Initialize configuration manager
    this.configManager = new ConfigManager();
    
    // Create FastMCP server instance
    this.mcpServer = new FastMCP({
      name: 'Unified MCP Server',
      version: this.configManager.getVersion()
    });

    // Initialize core components
    this.toolRegistry = new ToolRegistry(this.mcpServer);
    this.agentManager = new AgentManager(this.toolRegistry);
    this.taskManager = new TaskManager(this.agentManager);
    
    // Initialize API and integration layers
    this.apiManager = new APIManager(
      this.toolRegistry,
      this.agentManager,
      this.taskManager,
      this.configManager
    );
    
    this.integrationManager = new IntegrationManager(
      this.toolRegistry,
      this.agentManager,
      this.taskManager
    );
  }

  /**
   * Initialize the server and all its components
   */
  public async init(): Promise<void> {
    if (this.initialized) return;

    try {
      logger.info('Initializing Unified MCP Server...');
      
      // Initialize all components
      await this.configManager.init();
      await this.toolRegistry.init();
      await this.agentManager.init();
      await this.taskManager.init();
      await this.apiManager.init();
      await this.integrationManager.init();
      
      this.initialized = true;
      logger.info('Unified MCP Server initialized successfully');
    } catch (error) {
      logger.error(`Failed to initialize Unified MCP Server: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Start the server and all its components
   */
  public async start(): Promise<void> {
    if (!this.initialized) {
      await this.init();
    }

    try {
      logger.info('Starting Unified MCP Server...');
      
      // Start MCP server
      await this.mcpServer.start({
        transportType: 'stdio',
        timeout: 120000 // 2 minutes timeout
      });
      
      // Start API servers
      await this.apiManager.start();
      
      // Start integrations
      await this.integrationManager.start();
      
      logger.info('Unified MCP Server started successfully');
    } catch (error) {
      logger.error(`Failed to start Unified MCP Server: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Stop the server and all its components
   */
  public async stop(): Promise<void> {
    try {
      logger.info('Stopping Unified MCP Server...');
      
      // Stop integrations
      await this.integrationManager.stop();
      
      // Stop API servers
      await this.apiManager.stop();
      
      // Stop MCP server
      if (this.mcpServer) {
        await this.mcpServer.stop();
      }
      
      logger.info('Unified MCP Server stopped successfully');
    } catch (error) {
      logger.error(`Error stopping Unified MCP Server: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}

