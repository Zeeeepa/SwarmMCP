# Migration Guide: Moving to the Unified MCP Server

This guide provides instructions for migrating from the separate `serv` and `SwarmMCP` repositories to the new unified MCP server implementation.

## Overview

The unified MCP server combines the agent capabilities of `serv` with the task management features of `SwarmMCP` into a single cohesive system. This guide will help you transition your existing applications to use the new unified implementation.

## For `serv` Users

### Configuration Changes

The configuration format has been updated to accommodate the unified system. Here's how to update your configuration:

#### Before:

```typescript
import { createAgent } from '@qckfx/agent';
import { createAnthropicProvider } from '@qckfx/agent';

// Create model provider
const modelProvider = createAnthropicProvider({
  model: 'claude-3-7-sonnet-20250219'
});

// Create the agent
const agent = createAgent({
  modelProvider,
  environment: { 
    type: 'docker' // or 'local', 'e2b'
  }
});
```

#### After:

```typescript
import { createAgent } from '@zambe/unified-mcp';
import { createAnthropicProvider } from '@zambe/unified-mcp/providers';

// Create model provider
const modelProvider = createAnthropicProvider({
  model: 'claude-3-7-sonnet-20250219'
});

// Create the agent
const agent = createAgent({
  modelProvider,
  environment: { 
    type: 'docker' // or 'local', 'e2b'
  }
});
```

### API Changes

Most of the API remains the same, but there are some changes to accommodate the unified system:

1. The package name has changed from `@qckfx/agent` to `@zambe/unified-mcp`
2. Some imports have been reorganized into subpackages
3. New APIs are available for task management

### New Features

As a `serv` user, you now have access to the task management features from `SwarmMCP`:

```typescript
import { createTaskManager } from '@zambe/unified-mcp/task-management';

// Create a task manager
const taskManager = createTaskManager();

// Create a task
const task = await taskManager.createTask({
  title: 'Implement feature X',
  description: 'Implement feature X according to the spec',
  priority: 'medium'
});

// Add a subtask
await taskManager.addSubtask(task.id, {
  title: 'Design the API',
  description: 'Design the API for feature X',
  priority: 'high'
});
```

## For `SwarmMCP` Users

### Configuration Changes

The configuration format has been updated to accommodate the unified system. Here's how to update your configuration:

#### Before:

```json
{
  "mcpServers": {
    "agency-swarm": {
      "command": "npx",
      "args": ["-y", "agencyswarm-mcp"],
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

#### After:

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

### API Changes

Most of the API remains the same, but there are some changes to accommodate the unified system:

1. The package name has changed from `agencyswarm-mcp` to `@zambe/unified-mcp`
2. Some tool names have been updated for consistency
3. New APIs are available for agent management

### New Features

As a `SwarmMCP` user, you now have access to the agent capabilities from `serv`:

```javascript
// In your MCP client
const response = await client.runTool('createAgent', {
  name: 'My Agent',
  description: 'An agent for performing tasks',
  model: 'claude-3-7-sonnet-20250219',
  environment: 'docker'
});

const agentId = response.agentId;

// Use the agent to process a query
const result = await client.runTool('processAgentQuery', {
  agentId,
  query: 'What files are in this directory?'
});

console.log(result.response);
```

## Common Migration Steps

Regardless of which system you were using before, follow these steps to migrate to the unified implementation:

1. **Update Dependencies**: Update your package.json to use the new package:

```json
{
  "dependencies": {
    "@zambe/unified-mcp": "^1.0.0"
  }
}
```

2. **Update Imports**: Update your import statements to use the new package name.

3. **Update Configuration**: Update your configuration as described above.

4. **Test Your Application**: Test your application thoroughly to ensure it works with the new unified implementation.

5. **Update Documentation**: Update your documentation to reflect the new package name and APIs.

## Breaking Changes

Here are the breaking changes to be aware of:

1. **Package Name**: The package name has changed from `@qckfx/agent` or `agencyswarm-mcp` to `@zambe/unified-mcp`.

2. **Import Paths**: Some import paths have changed to accommodate the unified system.

3. **Configuration Format**: The configuration format has been updated to accommodate the unified system.

4. **Tool Names**: Some tool names have been updated for consistency.

## Compatibility Mode

If you need time to migrate your application, you can use the compatibility mode to continue using the old APIs:

```typescript
import { enableServCompatibility, enableSwarmMCPCompatibility } from '@zambe/unified-mcp/compatibility';

// Enable compatibility mode for serv
enableServCompatibility();

// OR

// Enable compatibility mode for SwarmMCP
enableSwarmMCPCompatibility();
```

This will allow you to continue using the old APIs while you migrate your application to the new unified implementation.

## Getting Help

If you encounter any issues during migration, please:

1. Check the [documentation](https://docs.zambe.ai/unified-mcp)
2. Open an issue on the [GitHub repository](https://github.com/Zeeeepa/unified-mcp)
3. Contact support at support@zambe.ai

