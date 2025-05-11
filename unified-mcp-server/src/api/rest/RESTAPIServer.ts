import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ToolRegistry } from '../../core/ToolRegistry';
import { AgentManager } from '../../core/AgentManager';
import { TaskManager } from '../../core/TaskManager';
import { ConfigManager } from '../../core/ConfigManager';
import { logger } from '../../utils/logger';
import { agentRoutes } from './routes/agentRoutes';
import { taskRoutes } from './routes/taskRoutes';
import { toolRoutes } from './routes/toolRoutes';
import { authMiddleware } from './middleware/authMiddleware';
import { errorHandler } from './middleware/errorHandler';

/**
 * REST API server for the unified MCP server
 */
export class RESTAPIServer {
  private app: Express;
  private server: any;
  private port: number;
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
    
    this.port = this.configManager.get('api.rest.port', 3001);
    this.app = express();
  }

  /**
   * Initialize the REST API server
   */
  public async init(): Promise<void> {
    try {
      logger.info('Initializing REST API server...');
      
      // Configure middleware
      this.setupMiddleware();
      
      // Configure routes
      this.setupRoutes();
      
      // Configure error handling
      this.setupErrorHandling();
      
      logger.info('REST API server initialized successfully');
    } catch (error) {
      logger.error(`Failed to initialize REST API server: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Start the REST API server
   */
  public async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(this.port, () => {
          logger.info(`REST API server listening on port ${this.port}`);
          resolve();
        });
      } catch (error) {
        logger.error(`Failed to start REST API server: ${error instanceof Error ? error.message : String(error)}`);
        reject(error);
      }
    });
  }

  /**
   * Stop the REST API server
   */
  public async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.server) {
        this.server.close((err: Error) => {
          if (err) {
            logger.error(`Error stopping REST API server: ${err.message}`);
            reject(err);
          } else {
            logger.info('REST API server stopped successfully');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Setup middleware for the REST API server
   */
  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    
    // CORS configuration
    const corsEnabled = this.configManager.get('server.cors.enabled', true);
    const corsOrigin = this.configManager.get('server.cors.origin', '*');
    
    if (corsEnabled) {
      this.app.use(cors({
        origin: corsOrigin,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
      }));
    }
    
    // Body parsing middleware
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // Authentication middleware
    this.app.use(authMiddleware(this.configManager));
    
    // Request logging
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      logger.debug(`REST API Request: ${req.method} ${req.path}`);
      next();
    });
  }

  /**
   * Setup routes for the REST API server
   */
  private setupRoutes(): void {
    // API version prefix
    const apiPrefix = '/api/v1';
    
    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({ status: 'ok', version: this.configManager.getVersion() });
    });
    
    // Mount routes
    this.app.use(`${apiPrefix}/agents`, agentRoutes(this.agentManager));
    this.app.use(`${apiPrefix}/tasks`, taskRoutes(this.taskManager));
    this.app.use(`${apiPrefix}/tools`, toolRoutes(this.toolRegistry));
    
    // 404 handler
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({ error: 'Not found' });
    });
  }

  /**
   * Setup error handling for the REST API server
   */
  private setupErrorHandling(): void {
    this.app.use(errorHandler);
  }
}

