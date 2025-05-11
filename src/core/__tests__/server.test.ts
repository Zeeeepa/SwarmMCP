import { MCPServer } from '../server';

describe('MCPServer', () => {
  let server: MCPServer;

  beforeEach(() => {
    server = new MCPServer({
      name: 'Test Server',
      version: '0.1.0',
      port: 3001,
      logLevel: 'error', // Minimize logging during tests
    });
  });

  afterEach(async () => {
    if (server.isRunning()) {
      await server.stop();
    }
  });

  test('should create a server with the correct configuration', () => {
    const config = server.getConfig();
    expect(config.name).toBe('Test Server');
    expect(config.version).toBe('0.1.0');
    expect(config.port).toBe(3001);
  });

  test('should initialize the server', async () => {
    await server.init();
    expect(server.isInitialized()).toBe(true);
    expect(server.isRunning()).toBe(false);
  });

  test('should start and stop the server', async () => {
    // Mock the FastMCP start and stop methods
    const mockStart = jest.fn().mockResolvedValue(undefined);
    const mockStop = jest.fn().mockResolvedValue(undefined);
    
    // @ts-ignore - Replace the real methods with mocks
    server.getFastMCPServer().start = mockStart;
    // @ts-ignore - Replace the real methods with mocks
    server.getFastMCPServer().stop = mockStop;

    // Start the server
    await server.start();
    expect(server.isInitialized()).toBe(true);
    expect(server.isRunning()).toBe(true);
    expect(mockStart).toHaveBeenCalledTimes(1);

    // Stop the server
    await server.stop();
    expect(server.isRunning()).toBe(false);
    expect(mockStop).toHaveBeenCalledTimes(1);
  });

  test('should provide access to plugin system and resource manager', () => {
    const pluginSystem = server.getPluginSystem();
    const resourceManager = server.getResourceManager();
    
    expect(pluginSystem).toBeDefined();
    expect(resourceManager).toBeDefined();
  });
});

