# Unified MCP Server

A comprehensive MCP server implementation that combines the agent capabilities of `serv` with the task management features of `SwarmMCP`.

## Features

- **Agent System**: Robust agent system with support for different execution environments
- **Task Management**: Comprehensive task management with support for tasks, subtasks, and dependencies
- **Tool Registry**: Extensive tool registry with support for tool discovery, execution, and permission management
- **Resource Management**: Comprehensive resource management for agents and tasks
- **API Layer**: RESTful and MCP-compatible APIs for client interactions
- **Execution Environments**: Support for multiple execution environments (local, Docker, E2B)
- **Checkpointing**: Git-based checkpointing system for safe action rollbacks
- **TypeScript**: Strong typing and better developer experience
- **Comprehensive Documentation**: Detailed documentation for users and developers
- **Comprehensive Testing**: Extensive test coverage for all functionality

## Installation

```bash
npm install @zambe/unified-mcp
```

## Quick Start

### Using as an MCP Server

```json
{
  "mcpServers": {
    "unified-mcp": {
      "command": "npx",
      "args": ["-y", "@zambe/unified-mcp"],
      "env": {
        "ANTHROPIC_API_KEY": "YOUR_ANTHROPIC_API_KEY_HERE",
        "PERPLEXITY_API_KEY": "YOUR_PERPLEXITY_API_KEY_HERE",
        "MODEL": "claude-3-7-sonnet-20250219",
        "PERPLEXITY_MODEL": "sonar-pro",
        "MAX_TOKENS": "64000",
        "TEMPERATURE": "0.2",
        "DEFAULT_SUBTASKS": "5",
        "DEFAULT_PRIORITY": "medium"
      }
    }
  }
}
```

### Using as a Library

```typescript
import { createUnifiedMCPServer } from '@zambe/unified-mcp';

// Create the server
const server = createUnifiedMCPServer({
  name: 'My MCP Server',
  version: '1.0.0',
  config: {
    anthropicApiKey: 'YOUR_ANTHROPIC_API_KEY_HERE',
    perplexityApiKey: 'YOUR_PERPLEXITY_API_KEY_HERE',
    model: 'claude-3-7-sonnet-20250219',
    perplexityModel: 'sonar-pro',
    maxTokens: 64000,
    temperature: 0.2,
    defaultSubtasks: 5,
    defaultPriority: 'medium'
  }
});

// Start the server
await server.start();

// Use the server
const agent = await server.createAgent({
  name: 'My Agent',
  description: 'An agent for performing tasks',
  model: 'claude-3-7-sonnet-20250219',
  environment: 'docker'
});

const task = await server.createTask({
  title: 'Implement feature X',
  description: 'Implement feature X according to the spec',
  priority: 'medium'
});

// Stop the server
await server.stop();
```

## Documentation

For more detailed information, check out the documentation:

- [Getting Started](https://docs.zambe.ai/unified-mcp/getting-started)
- [Agent System](https://docs.zambe.ai/unified-mcp/agent-system)
- [Task Management](https://docs.zambe.ai/unified-mcp/task-management)
- [Tool Registry](https://docs.zambe.ai/unified-mcp/tool-registry)
- [Resource Management](https://docs.zambe.ai/unified-mcp/resource-management)
- [API Reference](https://docs.zambe.ai/unified-mcp/api-reference)
- [Migration Guide](https://docs.zambe.ai/unified-mcp/migration-guide)

## Examples

Check out the examples directory for more examples:

- [Basic Agent](https://github.com/Zeeeepa/unified-mcp/tree/main/examples/basic-agent)
- [Task Management](https://github.com/Zeeeepa/unified-mcp/tree/main/examples/task-management)
- [Custom Tools](https://github.com/Zeeeepa/unified-mcp/tree/main/examples/custom-tools)
- [Resource Management](https://github.com/Zeeeepa/unified-mcp/tree/main/examples/resource-management)
- [MCP Server](https://github.com/Zeeeepa/unified-mcp/tree/main/examples/mcp-server)

## Contributing

Contributions are welcome! Please check out our [contributing guidelines](CONTRIBUTING.md) for more information.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

