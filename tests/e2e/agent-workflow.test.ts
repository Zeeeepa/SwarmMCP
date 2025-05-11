import { Agent } from '../../src/core/Agent';
import { MCPServer } from '../../src/mcp-server/server';
import { ToolRegistry } from '../../src/core/ToolRegistry';
import { FileReadTool } from '../../src/tools/FileReadTool';
import { FileWriteTool } from '../../src/tools/FileWriteTool';
import { BashTool } from '../../src/tools/BashTool';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('Agent Workflow End-to-End', () => {
  let agent: Agent;
  let mcpServer: MCPServer;
  let tempDir: string;
  
  beforeAll(async () => {
    // Create a temporary directory for file operations
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-e2e-'));
    
    // Start MCP server
    mcpServer = new MCPServer({ port: 3100 });
    await mcpServer.start();
  });
  
  afterAll(async () => {
    // Clean up
    await mcpServer.stop();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });
  
  beforeEach(() => {
    // Create a fresh agent for each test with real tools
    const toolRegistry = new ToolRegistry();
    
    // Register real tools that will be used in the tests
    toolRegistry.registerTool(new FileReadTool());
    toolRegistry.registerTool(new FileWriteTool());
    toolRegistry.registerTool(new BashTool());
    
    agent = new Agent({
      mcpServerUrl: 'http://localhost:3100',
      toolRegistry,
      // Configure with mock model provider in a real environment
      modelProvider: {
        name: 'anthropic',
        apiKey: 'mock-api-key',
        model: 'claude-3-opus-20240229'
      }
    });
  });
  
  it('should complete a full task workflow', async () => {
    // 1. Connect and register agent
    await agent.connect();
    await agent.register({
      name: 'WorkflowAgent',
      capabilities: ['file-operations', 'command-execution']
    });
    
    // 2. Create a test file
    const testFilePath = path.join(tempDir, 'test-file.txt');
    const testContent = 'Hello, world!';
    fs.writeFileSync(testFilePath, testContent);
    
    // 3. Create a task on the MCP server
    const taskId = await mcpServer.createTask({
      type: 'file-operations',
      data: {
        operation: 'modify',
        filePath: testFilePath,
        newContent: 'Modified content'
      }
    });
    
    // 4. Mock the model responses to simulate the agent's decision-making
    // This would typically be done by setting up the mock provider
    // to return specific responses for the test scenario
    
    // 5. Execute the task
    const result = await agent.executeTask(taskId);
    
    // 6. Verify the task was completed successfully
    expect(result.status).toBe('completed');
    
    // 7. Verify the file was modified
    const modifiedContent = fs.readFileSync(testFilePath, 'utf-8');
    expect(modifiedContent).toBe('Modified content');
    
    // 8. Verify the task result was reported to the MCP server
    const taskStatus = await mcpServer.getTaskStatus(taskId);
    expect(taskStatus).toBe('completed');
  });
  
  it('should handle error conditions gracefully', async () => {
    // Similar to the above test, but simulate error conditions
    await agent.connect();
    await agent.register({
      name: 'ErrorHandlingAgent',
      capabilities: ['file-operations']
    });
    
    // Create a task with an invalid file path
    const taskId = await mcpServer.createTask({
      type: 'file-operations',
      data: {
        operation: 'read',
        filePath: '/non/existent/path.txt'
      }
    });
    
    // Execute the task
    const result = await agent.executeTask(taskId);
    
    // Verify the task was marked as failed
    expect(result.status).toBe('failed');
    expect(result.error).toBeDefined();
    
    // Verify the error was reported to the MCP server
    const taskStatus = await mcpServer.getTaskStatus(taskId);
    expect(taskStatus).toBe('failed');
  });
});

