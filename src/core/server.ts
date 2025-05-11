import { FastMCP } from 'fastmcp';
import { ServerConfig, createServerConfig } from './server-config';
import { PluginSystem } from './plugin-system';
import { ResourceManager } from './resource-manager';
import logger from '../utils/logger';
import { ErrorHandler } from '../utils/error-handler';

/**
 * Main MCP server class
 */
export class MCPServer {
  private server: FastMCP;
  private config: ServerConfig;
  private pluginSystem: PluginSystem;
  private resourceManager: ResourceManager;
  private initialized: boolean = false;
  private running: boolean = false;

  /**
   * Create a new MCP server
   * @param config - Server configuration
   */
  constructor(config: Partial<ServerConfig> = {}) {
    // Create server configuration
    this.config = createServerConfig(config);
    
    // Configure logger
    process.env.LOG_LEVEL = this.config.logLevel;
    
    // Create FastMCP server
    this.server = new FastMCP({
      name: this.config.name,
      version: this.config.version,
      description: this.config.description,
    });
    
    // Create plugin system
    this.pluginSystem = new PluginSystem(this.server);
    
    // Create resource manager
    this.resourceManager = new ResourceManager(this.server);
    
    // Bind methods
    this.init = this.init.bind(this);
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
  }

  /**
   * Initialize the server
   */
  async init(): Promise<this> {
    if (this.initialized) {
      return this;
    }

    try {
      logger.info(`Initializing ${this.config.name} v${this.config.version}`);
      
      // Add default resource template
      this.resourceManager.addResourceTemplate({
        type: 'default',
        name: 'Default Template',
        description: 'Default resource template',
      });
      
      // Add default resource
      this.resourceManager.addResource({
        type: 'default',
        name: 'Default Resource',
        description: 'Default resource',
      });
      
      this.initialized = true;
      logger.info(`${this.config.name} initialized`);
      
      return this;
    } catch (error) {
      logger.error(`Failed to initialize server: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Start the server
   */
  async start(): Promise<this> {
    if (this.running) {
      return this;
    }

    try {
      // Initialize if not already initialized
      if (!this.initialized) {
        await this.init();
      }
      
      logger.info(`Starting ${this.config.name} v${this.config.version}`);
      
      // Start the FastMCP server
      await this.server.start({
        transportType: this.config.transport,
        timeout: this.config.timeout,
        port: this.config.port,
        host: this.config.host,
      });
      
      this.running = true;
      logger.info(`${this.config.name} started on ${this.config.host}:${this.config.port}`);
      
      return this;
    } catch (error) {
      logger.error(`Failed to start server: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Stop the server
   */
  async stop(): Promise<this> {
    if (!this.running) {
      return this;
    }

    try {
      logger.info(`Stopping ${this.config.name}`);
      
      // Stop the FastMCP server
      await this.server.stop();
      
      this.running = false;
      logger.info(`${this.config.name} stopped`);
      
      return this;
    } catch (error) {
      logger.error(`Failed to stop server: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Get the plugin system
   */
  getPluginSystem(): PluginSystem {
    return this.pluginSystem;
  }

  /**
   * Get the resource manager
   */
  getResourceManager(): ResourceManager {
    return this.resourceManager;
  }

  /**
   * Get the FastMCP server instance
   */
  getFastMCPServer(): FastMCP {
    return this.server;
  }

  /**
   * Get the server configuration
   */
  getConfig(): ServerConfig {
    return this.config;
  }

  /**
   * Check if the server is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Check if the server is running
   */
  isRunning(): boolean {
    return this.running;
  }
}

export default MCPServer;

