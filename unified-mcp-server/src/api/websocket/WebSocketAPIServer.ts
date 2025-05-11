import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { ToolRegistry } from '../../core/ToolRegistry';
import { AgentManager } from '../../core/AgentManager';
import { TaskManager } from '../../core/TaskManager';
import { ConfigManager } from '../../core/ConfigManager';
import { logger } from '../../utils/logger';
import { verifyToken } from '../rest/middleware/authMiddleware';

/**
 * WebSocket API server for the unified MCP server
 */
export class WebSocketAPIServer {
  private httpServer: HTTPServer;
  private io: SocketIOServer;
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
    
    this.port = this.configManager.get('api.websocket.port', 3002);
    
    // Create HTTP server
    this.httpServer = new HTTPServer();
    
    // Create Socket.IO server
    this.io = new SocketIOServer(this.httpServer, {
      cors: {
        origin: this.configManager.get('server.cors.origin', '*'),
        methods: ['GET', 'POST']
      }
    });
  }

  /**
   * Initialize the WebSocket API server
   */
  public async init(): Promise<void> {
    try {
      logger.info('Initializing WebSocket API server...');
      
      // Setup authentication middleware
      this.setupAuthentication();
      
      // Setup event handlers
      this.setupEventHandlers();
      
      logger.info('WebSocket API server initialized successfully');
    } catch (error) {
      logger.error(`Failed to initialize WebSocket API server: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Start the WebSocket API server
   */
  public async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.httpServer.listen(this.port, () => {
          logger.info(`WebSocket API server listening on port ${this.port}`);
          resolve();
        });
      } catch (error) {
        logger.error(`Failed to start WebSocket API server: ${error instanceof Error ? error.message : String(error)}`);
        reject(error);
      }
    });
  }

  /**
   * Stop the WebSocket API server
   */
  public async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.io.close((err) => {
        if (err) {
          logger.error(`Error stopping WebSocket API server: ${err.message}`);
          reject(err);
        } else {
          this.httpServer.close((httpErr) => {
            if (httpErr) {
              logger.error(`Error stopping WebSocket HTTP server: ${httpErr.message}`);
              reject(httpErr);
            } else {
              logger.info('WebSocket API server stopped successfully');
              resolve();
            }
          });
        }
      });
    });
  }

  /**
   * Setup authentication for the WebSocket API server
   */
  private setupAuthentication(): void {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
        
        if (!token) {
          return next(new Error('Authentication token is required'));
        }
        
        try {
          const decoded = verifyToken(token, this.configManager.get('security.jwt.secret', ''));
          socket.data.user = decoded;
          next();
        } catch (error) {
          next(new Error('Invalid authentication token'));
        }
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });
  }

  /**
   * Setup event handlers for the WebSocket API server
   */
  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      logger.info(`WebSocket client connected: ${socket.id}`);
      
      // Setup agent-related events
      this.setupAgentEvents(socket);
      
      // Setup task-related events
      this.setupTaskEvents(socket);
      
      // Setup tool-related events
      this.setupToolEvents(socket);
      
      // Handle disconnection
      socket.on('disconnect', () => {
        logger.info(`WebSocket client disconnected: ${socket.id}`);
      });
    });
  }

  /**
   * Setup agent-related event handlers
   * @param socket - The socket connection
   */
  private setupAgentEvents(socket: Socket): void {
    // Create agent
    socket.on('agent:create', async (data, callback) => {
      try {
        const agent = this.agentManager.createAgent(data);
        callback({ success: true, agent });
      } catch (error) {
        callback({ 
          success: false, 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
    });

    // Get agent
    socket.on('agent:get', async (data, callback) => {
      try {
        const agent = this.agentManager.getAgent(data.agentId);
        
        if (!agent) {
          return callback({ success: false, error: 'Agent not found' });
        }
        
        callback({ success: true, agent });
      } catch (error) {
        callback({ 
          success: false, 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
    });

    // List agents
    socket.on('agent:list', async (data, callback) => {
      try {
        const agents = this.agentManager.listAgents(data?.filter);
        callback({ success: true, agents });
      } catch (error) {
        callback({ 
          success: false, 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
    });

    // Update agent
    socket.on('agent:update', async (data, callback) => {
      try {
        const agent = this.agentManager.updateAgent(data.agentId, data.config);
        callback({ success: true, agent });
      } catch (error) {
        callback({ 
          success: false, 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
    });

    // Delete agent
    socket.on('agent:delete', async (data, callback) => {
      try {
        const success = this.agentManager.deleteAgent(data.agentId);
        callback({ success });
      } catch (error) {
        callback({ 
          success: false, 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
    });

    // Run agent
    socket.on('agent:run', async (data, callback) => {
      try {
        const result = await this.agentManager.runAgent(data.agentId, data.task);
        callback({ success: true, result });
      } catch (error) {
        callback({ 
          success: false, 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
    });
  }

  /**
   * Setup task-related event handlers
   * @param socket - The socket connection
   */
  private setupTaskEvents(socket: Socket): void {
    // Create task
    socket.on('task:create', async (data, callback) => {
      try {
        const task = this.taskManager.createTask(
          data.title,
          data.description,
          data.dependencies || []
        );
        callback({ success: true, task });
      } catch (error) {
        callback({ 
          success: false, 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
    });

    // Get task
    socket.on('task:get', async (data, callback) => {
      try {
        const task = this.taskManager.getTask(data.taskId);
        
        if (!task) {
          return callback({ success: false, error: 'Task not found' });
        }
        
        callback({ success: true, task });
      } catch (error) {
        callback({ 
          success: false, 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
    });

    // List tasks
    socket.on('task:list', async (data, callback) => {
      try {
        const tasks = this.taskManager.listTasks(data?.filter);
        callback({ success: true, tasks });
      } catch (error) {
        callback({ 
          success: false, 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
    });

    // Update task
    socket.on('task:update', async (data, callback) => {
      try {
        const task = this.taskManager.updateTask(data.taskId, data.updates);
        callback({ success: true, task });
        
        // Broadcast task update to all clients
        socket.broadcast.emit('task:updated', { taskId: task.id, task });
      } catch (error) {
        callback({ 
          success: false, 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
    });

    // Delete task
    socket.on('task:delete', async (data, callback) => {
      try {
        const success = this.taskManager.deleteTask(data.taskId);
        callback({ success });
        
        if (success) {
          // Broadcast task deletion to all clients
          socket.broadcast.emit('task:deleted', { taskId: data.taskId });
        }
      } catch (error) {
        callback({ 
          success: false, 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
    });

    // Add dependency
    socket.on('task:addDependency', async (data, callback) => {
      try {
        const task = this.taskManager.addDependency(data.taskId, data.dependsOnTaskId);
        callback({ success: true, task });
      } catch (error) {
        callback({ 
          success: false, 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
    });

    // Remove dependency
    socket.on('task:removeDependency', async (data, callback) => {
      try {
        const task = this.taskManager.removeDependency(data.taskId, data.dependsOnTaskId);
        callback({ success: true, task });
      } catch (error) {
        callback({ 
          success: false, 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
    });

    // Get next task
    socket.on('task:getNext', async (data, callback) => {
      try {
        const task = this.taskManager.getNextTask();
        callback({ success: true, task });
      } catch (error) {
        callback({ 
          success: false, 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
    });
  }

  /**
   * Setup tool-related event handlers
   * @param socket - The socket connection
   */
  private setupToolEvents(socket: Socket): void {
    // List tools
    socket.on('tool:list', async (data, callback) => {
      try {
        const tools = this.toolRegistry.getAllTools();
        callback({ success: true, tools });
      } catch (error) {
        callback({ 
          success: false, 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
    });

    // Execute tool
    socket.on('tool:execute', async (data, callback) => {
      try {
        const tool = this.toolRegistry.getTool(data.name);
        
        if (!tool) {
          return callback({ success: false, error: 'Tool not found' });
        }
        
        const result = await tool.handler(data.parameters || {});
        callback({ success: true, result });
      } catch (error) {
        callback({ 
          success: false, 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
    });
  }
}

