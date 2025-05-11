import { ToolRegistry } from './ToolRegistry';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

/**
 * Interface for agent configuration
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
 * Interface for agent instance
 */
export interface Agent {
  id: string;
  config: AgentConfig;
  state: 'idle' | 'running' | 'paused' | 'error';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Manager for AI agents in the unified MCP server
 * Adapts functionality from the serv repository
 */
export class AgentManager {
  private agents: Map<string, Agent> = new Map();
  private toolRegistry: ToolRegistry;

  constructor(toolRegistry: ToolRegistry) {
    this.toolRegistry = toolRegistry;
  }

  /**
   * Initialize the agent manager
   */
  public async init(): Promise<void> {
    try {
      logger.info('Initializing Agent Manager...');
      
      // Register agent-specific tools
      this.registerAgentTools();
      
      logger.info('Agent Manager initialized successfully');
    } catch (error) {
      logger.error(`Failed to initialize Agent Manager: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Create a new agent
   * @param config - The agent configuration
   */
  public createAgent(config: AgentConfig): Agent {
    const id = uuidv4();
    const now = new Date();
    
    const agent: Agent = {
      id,
      config,
      state: 'idle',
      createdAt: now,
      updatedAt: now
    };
    
    this.agents.set(id, agent);
    logger.info(`Created agent: ${id} (${config.name})`);
    
    return agent;
  }

  /**
   * Get an agent by ID
   * @param id - The agent ID
   */
  public getAgent(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  /**
   * List all agents
   * @param filter - Optional filter criteria
   */
  public listAgents(filter?: Partial<AgentConfig>): Agent[] {
    const agents = Array.from(this.agents.values());
    
    if (!filter) {
      return agents;
    }
    
    return agents.filter(agent => {
      for (const [key, value] of Object.entries(filter)) {
        if (key in agent.config && agent.config[key as keyof AgentConfig] !== value) {
          return false;
        }
      }
      return true;
    });
  }

  /**
   * Run an agent with a specific task
   * @param agentId - The agent ID
   * @param task - The task for the agent to perform
   */
  public async runAgent(agentId: string, task: string): Promise<any> {
    const agent = this.getAgent(agentId);
    
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }
    
    try {
      // Update agent state
      agent.state = 'running';
      agent.updatedAt = new Date();
      this.agents.set(agentId, agent);
      
      logger.info(`Running agent ${agentId} with task: ${task}`);
      
      // Placeholder for actual agent execution logic
      // This will be implemented with the serv agent execution system
      const result = { success: true, output: `Executed task: ${task}` };
      
      // Update agent state
      agent.state = 'idle';
      agent.updatedAt = new Date();
      this.agents.set(agentId, agent);
      
      return result;
    } catch (error) {
      // Update agent state to error
      agent.state = 'error';
      agent.updatedAt = new Date();
      this.agents.set(agentId, agent);
      
      logger.error(`Error running agent ${agentId}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Delete an agent
   * @param agentId - The agent ID
   */
  public deleteAgent(agentId: string): boolean {
    const exists = this.agents.has(agentId);
    
    if (exists) {
      this.agents.delete(agentId);
      logger.info(`Deleted agent: ${agentId}`);
    }
    
    return exists;
  }

  /**
   * Update an agent's configuration
   * @param agentId - The agent ID
   * @param config - The updated configuration
   */
  public updateAgent(agentId: string, config: Partial<AgentConfig>): Agent {
    const agent = this.getAgent(agentId);
    
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }
    
    // Update configuration
    agent.config = { ...agent.config, ...config };
    agent.updatedAt = new Date();
    
    this.agents.set(agentId, agent);
    logger.info(`Updated agent: ${agentId}`);
    
    return agent;
  }

  /**
   * Register agent-specific tools with the tool registry
   */
  private registerAgentTools(): void {
    // These tools will be available to manage agents
    this.toolRegistry.registerTool({
      name: 'agent_list',
      description: 'List all available agents',
      parameters: {
        filter: {
          type: 'object',
          description: 'Optional filter criteria',
          required: false
        }
      },
      handler: async (params) => {
        return { agents: this.listAgents(params.filter) };
      }
    });

    this.toolRegistry.registerTool({
      name: 'agent_get',
      description: 'Get an agent by ID',
      parameters: {
        agentId: {
          type: 'string',
          description: 'ID of the agent to get'
        }
      },
      handler: async (params) => {
        const agent = this.getAgent(params.agentId);
        if (!agent) {
          throw new Error(`Agent not found: ${params.agentId}`);
        }
        return { agent };
      }
    });

    this.toolRegistry.registerTool({
      name: 'agent_delete',
      description: 'Delete an agent',
      parameters: {
        agentId: {
          type: 'string',
          description: 'ID of the agent to delete'
        }
      },
      handler: async (params) => {
        const success = this.deleteAgent(params.agentId);
        return { success };
      }
    });
  }
}

