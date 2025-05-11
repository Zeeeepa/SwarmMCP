import { Agent } from '../../src/core/Agent';
import { MCPServer } from '../../src/mcp-server/server';
import { ContextManager } from '../../src/mcp-server/core/context-manager';

// Use a test port to avoid conflicts
const TEST_PORT = 3099;

describe('Agent-MCP Integration', () => {
  let agent: Agent;
  let mcpServer: MCPServer;

  beforeAll(async () => {
    // Start MCP server for integration tests
    mcpServer = new MCPServer({ 
      port: TEST_PORT,
      contextManager: new ContextManager({
        maxCacheSize: 10,
        ttl: 60000,
        maxContextSize: 10000
      })
    });
    
    await mcpServer.start();
  });

  afterAll(async () => {
    // Clean up server after tests
    await mcpServer.stop();
  });

  beforeEach(() => {
    // Create a fresh agent for each test
    agent = new Agent({
      mcpServerUrl: `http://localhost:${TEST_PORT}`,
      // Add other required configuration
    });
  });

  it('should connect agent to MCP server', async () => {
    const connected = await agent.connect();
    expect(connected).toBe(true);
    expect(agent.isConnected()).toBe(true);
  });

  it('should register agent with MCP server', async () => {
    await agent.connect();
    const registered = await agent.register({
      name: 'TestAgent',
      capabilities: ['text-processing']
    });
    
    expect(registered).toBe(true);
    
    // Verify the agent is registered on the server
    const agents = await mcpServer.getRegisteredAgents();
    expect(agents).toContainEqual(expect.objectContaining({
      name: 'TestAgent'
    }));
  });

  it('should execute a task through MCP', async () => {
    await agent.connect();
    await agent.register({
      name: 'TestAgent',
      capabilities: ['text-processing']
    });
    
    // Create a task on the MCP server
    const taskId = await mcpServer.createTask({
      type: 'text-processing',
      data: {
        text: 'Process this text'
      }
    });
    
    // Agent should be able to fetch and execute the task
    const result = await agent.executeNextTask();
    
    expect(result).toBeDefined();
    expect(result.taskId).toBe(taskId);
    expect(result.status).toBe('completed');
  });

  it('should handle context updates between agent and MCP server', async () => {
    await agent.connect();
    
    // Set context on the agent
    await agent.updateContext({
      key1: 'value1',
      key2: 'value2'
    });
    
    // Verify context is synchronized with MCP server
    const serverContext = await mcpServer.getAgentContext(agent.getId());
    
    expect(serverContext).toEqual(expect.objectContaining({
      key1: 'value1',
      key2: 'value2'
    }));
    
    // Update context on server
    await mcpServer.updateAgentContext(agent.getId(), {
      key3: 'value3'
    });
    
    // Verify agent receives context update
    const agentContext = await agent.getContext();
    
    expect(agentContext).toEqual(expect.objectContaining({
      key1: 'value1',
      key2: 'value2',
      key3: 'value3'
    }));
  });
});

