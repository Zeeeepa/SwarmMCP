import { ToolRegistry } from '../core/ToolRegistry';
import { AgentManager } from '../core/AgentManager';
import { TaskManager } from '../core/TaskManager';
import { logger } from '../utils/logger';
import { CursorAIIntegration } from './cursor/CursorAIIntegration';
import { MCPClientIntegration } from './mcp-client/MCPClientIntegration';

/**
 * Manager for external integrations in the unified MCP server
 */
export class IntegrationManager {
  private toolRegistry: ToolRegistry;
  private agentManager: AgentManager;
  private taskManager: TaskManager;
  
  private cursorAIIntegration?: CursorAIIntegration;
  private mcpClientIntegration?: MCPClientIntegration;

  constructor(
    toolRegistry: ToolRegistry,
    agentManager: AgentManager,
    taskManager: TaskManager
  ) {
    this.toolRegistry = toolRegistry;
    this.agentManager = agentManager;
    this.taskManager = taskManager;
  }

  /**
   * Initialize all integrations
   */
  public async init(): Promise<void> {
    try {
      logger.info('Initializing Integration Manager...');
      
      // Initialize Cursor AI integration
      this.cursorAIIntegration = new CursorAIIntegration(
        this.toolRegistry,
        this.agentManager,
        this.taskManager
      );
      await this.cursorAIIntegration.init();
      
      // Initialize MCP client integration
      this.mcpClientIntegration = new MCPClientIntegration(
        this.toolRegistry,
        this.agentManager,
        this.taskManager
      );
      await this.mcpClientIntegration.init();
      
      logger.info('Integration Manager initialized successfully');
    } catch (error) {
      logger.error(`Failed to initialize Integration Manager: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Start all integrations
   */
  public async start(): Promise<void> {
    try {
      logger.info('Starting integrations...');
      
      // Start Cursor AI integration
      if (this.cursorAIIntegration) {
        await this.cursorAIIntegration.start();
      }
      
      // Start MCP client integration
      if (this.mcpClientIntegration) {
        await this.mcpClientIntegration.start();
      }
      
      logger.info('Integrations started successfully');
    } catch (error) {
      logger.error(`Failed to start integrations: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Stop all integrations
   */
  public async stop(): Promise<void> {
    try {
      logger.info('Stopping integrations...');
      
      // Stop Cursor AI integration
      if (this.cursorAIIntegration) {
        await this.cursorAIIntegration.stop();
      }
      
      // Stop MCP client integration
      if (this.mcpClientIntegration) {
        await this.mcpClientIntegration.stop();
      }
      
      logger.info('Integrations stopped successfully');
    } catch (error) {
      logger.error(`Error stopping integrations: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}

