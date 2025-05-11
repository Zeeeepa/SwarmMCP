/**
 * TypeScript client for the Unified MCP Server
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { io, Socket } from 'socket.io-client';

/**
 * Configuration for the Unified MCP client
 */
export interface UnifiedMCPClientConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
  websocket?: boolean;
  websocketUrl?: string;
}

/**
 * Agent configuration interface
 */
export interface AgentConfig {
  name: string;
  description?: string;
  model?: string;
  tools?: string[];
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * Agent interface
 */
export interface Agent {
  id: string;
  config: AgentConfig;
  state: 'idle' | 'running' | 'paused' | 'error';
  createdAt: string;
  updatedAt: string;
}

/**
 * Task status type
 */
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'blocked';

/**
 * Task interface
 */
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  dependencies: string[];
  subtasks: string[];
  assignedAgentId?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

/**
 * Tool interface
 */
export interface Tool {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

/**
 * Main client class for interacting with the Unified MCP Server
 */
export class UnifiedMCPClient {
  private config: UnifiedMCPClientConfig;
  private httpClient: AxiosInstance;
  private socket: Socket | null = null;
  private eventHandlers: Map<string, ((...args: any[]) => void)[]> = new Map();

  /**
   * Create a new Unified MCP client
   * @param config - Client configuration
   */
  constructor(config: UnifiedMCPClientConfig) {
    this.config = {
      timeout: 30000,
      websocket: true,
      ...config
    };

    // Create HTTP client
    this.httpClient = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey ? { 'Authorization': `Bearer ${this.config.apiKey}` } : {})
      }
    });

    // Setup WebSocket if enabled
    if (this.config.websocket) {
      this.setupWebSocket();
    }
  }

  /**
   * Setup WebSocket connection
   */
  private setupWebSocket(): void {
    const url = this.config.websocketUrl || this.config.baseUrl;
    
    this.socket = io(url, {
      auth: {
        token: this.config.apiKey
      }
    });

    this.socket.on('connect', () => {
      console.log('Connected to Unified MCP Server via WebSocket');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from Unified MCP Server WebSocket');
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Setup event handlers
    this.socket.on('task:updated', (data) => {
      this.triggerEvent('taskUpdated', data);
    });

    this.socket.on('task:deleted', (data) => {
      this.triggerEvent('taskDeleted', data);
    });

    this.socket.on('agent:updated', (data) => {
      this.triggerEvent('agentUpdated', data);
    });
  }

  /**
   * Register an event handler
   * @param event - Event name
   * @param handler - Event handler function
   */
  public on(event: string, handler: (...args: any[]) => void): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    
    this.eventHandlers.get(event)!.push(handler);
  }

  /**
   * Remove an event handler
   * @param event - Event name
   * @param handler - Event handler function
   */
  public off(event: string, handler: (...args: any[]) => void): void {
    if (!this.eventHandlers.has(event)) {
      return;
    }
    
    const handlers = this.eventHandlers.get(event)!;
    const index = handlers.indexOf(handler);
    
    if (index !== -1) {
      handlers.splice(index, 1);
    }
  }

  /**
   * Trigger an event
   * @param event - Event name
   * @param args - Event arguments
   */
  private triggerEvent(event: string, ...args: any[]): void {
    if (!this.eventHandlers.has(event)) {
      return;
    }
    
    for (const handler of this.eventHandlers.get(event)!) {
      try {
        handler(...args);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    }
  }

  /**
   * Make an HTTP request to the server
   * @param method - HTTP method
   * @param path - API path
   * @param data - Request data
   * @param config - Additional Axios config
   */
  private async request<T>(
    method: string,
    path: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.httpClient.request<T>({
        method,
        url: path,
        data,
        ...config
      });
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(`API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  /**
   * Make a WebSocket request to the server
   * @param event - Event name
   * @param data - Request data
   */
  private async socketRequest<T>(event: string, data?: any): Promise<T> {
    if (!this.socket) {
      throw new Error('WebSocket is not enabled or connected');
    }
    
    return new Promise<T>((resolve, reject) => {
      this.socket!.emit(event, data, (response: any) => {
        if (response.success) {
          resolve(response as T);
        } else {
          reject(new Error(response.error || 'Unknown error'));
        }
      });
    });
  }

  /**
   * Check server health
   */
  public async health(): Promise<{ status: string; version: string }> {
    return this.request<{ status: string; version: string }>('GET', '/health');
  }

  // Agent-related methods

  /**
   * Create a new agent
   * @param config - Agent configuration
   */
  public async createAgent(config: AgentConfig): Promise<Agent> {
    if (this.socket) {
      const response = await this.socketRequest<{ success: boolean; agent: Agent }>('agent:create', config);
      return response.agent;
    } else {
      return this.request<Agent>('POST', '/api/v1/agents', config);
    }
  }

  /**
   * Get an agent by ID
   * @param agentId - Agent ID
   */
  public async getAgent(agentId: string): Promise<Agent> {
    if (this.socket) {
      const response = await this.socketRequest<{ success: boolean; agent: Agent }>('agent:get', { agentId });
      return response.agent;
    } else {
      return this.request<Agent>('GET', `/api/v1/agents/${agentId}`);
    }
  }

  /**
   * List all agents
   * @param filter - Optional filter criteria
   */
  public async listAgents(filter?: Partial<AgentConfig>): Promise<Agent[]> {
    if (this.socket) {
      const response = await this.socketRequest<{ success: boolean; agents: Agent[] }>('agent:list', { filter });
      return response.agents;
    } else {
      return this.request<Agent[]>('GET', '/api/v1/agents', undefined, {
        params: { filter: filter ? JSON.stringify(filter) : undefined }
      });
    }
  }

  /**
   * Update an agent
   * @param agentId - Agent ID
   * @param config - Updated agent configuration
   */
  public async updateAgent(agentId: string, config: Partial<AgentConfig>): Promise<Agent> {
    if (this.socket) {
      const response = await this.socketRequest<{ success: boolean; agent: Agent }>('agent:update', { agentId, config });
      return response.agent;
    } else {
      return this.request<Agent>('PUT', `/api/v1/agents/${agentId}`, config);
    }
  }

  /**
   * Delete an agent
   * @param agentId - Agent ID
   */
  public async deleteAgent(agentId: string): Promise<boolean> {
    if (this.socket) {
      const response = await this.socketRequest<{ success: boolean }>('agent:delete', { agentId });
      return response.success;
    } else {
      await this.request<void>('DELETE', `/api/v1/agents/${agentId}`);
      return true;
    }
  }

  /**
   * Run an agent with a task
   * @param agentId - Agent ID
   * @param task - Task for the agent to perform
   */
  public async runAgent(agentId: string, task: string): Promise<any> {
    if (this.socket) {
      const response = await this.socketRequest<{ success: boolean; result: any }>('agent:run', { agentId, task });
      return response.result;
    } else {
      return this.request<any>('POST', `/api/v1/agents/${agentId}/run`, { task });
    }
  }

  // Task-related methods

  /**
   * Create a new task
   * @param title - Task title
   * @param description - Task description
   * @param dependencies - Optional array of task IDs this task depends on
   */
  public async createTask(title: string, description: string, dependencies: string[] = []): Promise<Task> {
    if (this.socket) {
      const response = await this.socketRequest<{ success: boolean; task: Task }>('task:create', {
        title,
        description,
        dependencies
      });
      return response.task;
    } else {
      return this.request<Task>('POST', '/api/v1/tasks', {
        title,
        description,
        dependencies
      });
    }
  }

  /**
   * Get a task by ID
   * @param taskId - Task ID
   */
  public async getTask(taskId: string): Promise<Task> {
    if (this.socket) {
      const response = await this.socketRequest<{ success: boolean; task: Task }>('task:get', { taskId });
      return response.task;
    } else {
      return this.request<Task>('GET', `/api/v1/tasks/${taskId}`);
    }
  }

  /**
   * List all tasks
   * @param filter - Optional filter criteria
   */
  public async listTasks(filter?: Partial<Task>): Promise<Task[]> {
    if (this.socket) {
      const response = await this.socketRequest<{ success: boolean; tasks: Task[] }>('task:list', { filter });
      return response.tasks;
    } else {
      return this.request<Task[]>('GET', '/api/v1/tasks', undefined, {
        params: { filter: filter ? JSON.stringify(filter) : undefined }
      });
    }
  }

  /**
   * Update a task
   * @param taskId - Task ID
   * @param updates - Updates to apply
   */
  public async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    if (this.socket) {
      const response = await this.socketRequest<{ success: boolean; task: Task }>('task:update', { taskId, updates });
      return response.task;
    } else {
      return this.request<Task>('PUT', `/api/v1/tasks/${taskId}`, updates);
    }
  }

  /**
   * Delete a task
   * @param taskId - Task ID
   */
  public async deleteTask(taskId: string): Promise<boolean> {
    if (this.socket) {
      const response = await this.socketRequest<{ success: boolean }>('task:delete', { taskId });
      return response.success;
    } else {
      await this.request<void>('DELETE', `/api/v1/tasks/${taskId}`);
      return true;
    }
  }

  /**
   * Add a dependency between tasks
   * @param taskId - The dependent task ID
   * @param dependsOnTaskId - The task ID that is depended on
   */
  public async addDependency(taskId: string, dependsOnTaskId: string): Promise<Task> {
    if (this.socket) {
      const response = await this.socketRequest<{ success: boolean; task: Task }>('task:addDependency', {
        taskId,
        dependsOnTaskId
      });
      return response.task;
    } else {
      return this.request<Task>('POST', `/api/v1/tasks/${taskId}/dependencies`, { dependsOnTaskId });
    }
  }

  /**
   * Remove a dependency between tasks
   * @param taskId - The dependent task ID
   * @param dependsOnTaskId - The task ID that is depended on
   */
  public async removeDependency(taskId: string, dependsOnTaskId: string): Promise<Task> {
    if (this.socket) {
      const response = await this.socketRequest<{ success: boolean; task: Task }>('task:removeDependency', {
        taskId,
        dependsOnTaskId
      });
      return response.task;
    } else {
      return this.request<Task>('DELETE', `/api/v1/tasks/${taskId}/dependencies/${dependsOnTaskId}`);
    }
  }

  /**
   * Get the next available task
   */
  public async getNextTask(): Promise<Task | null> {
    if (this.socket) {
      const response = await this.socketRequest<{ success: boolean; task: Task | null }>('task:getNext', {});
      return response.task;
    } else {
      return this.request<Task | null>('GET', '/api/v1/tasks/next');
    }
  }

  // Tool-related methods

  /**
   * List all available tools
   */
  public async listTools(): Promise<Tool[]> {
    if (this.socket) {
      const response = await this.socketRequest<{ success: boolean; tools: Tool[] }>('tool:list', {});
      return response.tools;
    } else {
      return this.request<Tool[]>('GET', '/api/v1/tools');
    }
  }

  /**
   * Execute a tool
   * @param name - Tool name
   * @param parameters - Tool parameters
   */
  public async executeTool(name: string, parameters: Record<string, any> = {}): Promise<any> {
    if (this.socket) {
      const response = await this.socketRequest<{ success: boolean; result: any }>('tool:execute', {
        name,
        parameters
      });
      return response.result;
    } else {
      return this.request<any>('POST', `/api/v1/tools/${name}/execute`, { parameters });
    }
  }

  /**
   * Close the client connection
   */
  public close(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

// Export default client
export default UnifiedMCPClient;

