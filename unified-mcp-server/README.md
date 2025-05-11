# Unified MCP Server

A unified implementation that combines the strengths of the `serv` and `SwarmMCP` repositories, providing a comprehensive API and integration layer for AI agents and task management.

## Features

- **Unified API Layer**
  - HTTP REST API
  - WebSocket API
  - Command-line interface
  - MCP protocol interface

- **Client Libraries**
  - JavaScript/TypeScript
  - Python
  - Command-line tools

- **Core Functionality**
  - AI Agent Management
  - Task Management
  - Tool Registry
  - Execution Environments
  - Checkpointing

- **Integrations**
  - Cursor AI
  - Other MCP clients
  - CI/CD systems (optional)

## Architecture

The Unified MCP Server follows a modular architecture with the following components:

1. **Core Components**
   - `UnifiedMCPServer`: Main server class that orchestrates all components
   - `ConfigManager`: Handles server configuration and settings
   - `ToolRegistry`: Manages tools from both repositories
   - `AgentManager`: Handles AI agent management
   - `TaskManager`: Manages tasks and dependencies

2. **API Layer**
   - `APIManager`: Coordinates all API interfaces
   - `RESTAPIServer`: Implements HTTP REST API
   - `WebSocketAPIServer`: Implements real-time WebSocket API
   - `CLIInterface`: Provides command-line interface
   - `MCPInterface`: Implements MCP protocol support

3. **Integration Layer**
   - `IntegrationManager`: Manages external integrations
   - `CursorAIIntegration`: Integration with Cursor AI
   - `MCPClientIntegration`: Integration with other MCP clients

4. **Client Libraries**
   - TypeScript/JavaScript Client
   - Python Client
   - CLI Client

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/zambe/unified-mcp-server.git
   cd unified-mcp-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

### Configuration

Create a `.env` file in the root directory with the following variables:

```
# Server configuration
PORT=3000
HOST=localhost
CORS_ENABLED=true
CORS_ORIGIN=*

# API configuration
REST_API_PORT=3001
WS_API_PORT=3002

# Security configuration
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d
RATE_LIMITING_ENABLED=true
RATE_LIMITING_WINDOW_MS=60000
RATE_LIMITING_MAX=100

# Logging configuration
LOG_LEVEL=info
LOG_FILE_ENABLED=true

# Integration configuration
CURSOR_AI_INTEGRATION_ENABLED=true
```

### Running the Server

```bash
npm start
```

For development with hot reloading:

```bash
npm run dev
```

## API Documentation

### REST API

The REST API is available at `http://localhost:3001/api/v1` by default.

#### Endpoints

- **Agents**
  - `GET /api/v1/agents`: List all agents
  - `GET /api/v1/agents/:id`: Get an agent by ID
  - `POST /api/v1/agents`: Create a new agent
  - `PUT /api/v1/agents/:id`: Update an agent
  - `DELETE /api/v1/agents/:id`: Delete an agent
  - `POST /api/v1/agents/:id/run`: Run an agent with a task

- **Tasks**
  - `GET /api/v1/tasks`: List all tasks
  - `GET /api/v1/tasks/:id`: Get a task by ID
  - `POST /api/v1/tasks`: Create a new task
  - `PUT /api/v1/tasks/:id`: Update a task
  - `DELETE /api/v1/tasks/:id`: Delete a task
  - `GET /api/v1/tasks/next`: Get the next available task
  - `POST /api/v1/tasks/:id/dependencies`: Add a dependency between tasks
  - `DELETE /api/v1/tasks/:id/dependencies/:dependsOnId`: Remove a dependency between tasks

- **Tools**
  - `GET /api/v1/tools`: List all available tools
  - `GET /api/v1/tools/:name`: Get a tool by name
  - `POST /api/v1/tools/:name/execute`: Execute a tool

### WebSocket API

The WebSocket API is available at `ws://localhost:3002` by default.

#### Events

- **Agent Events**
  - `agent:create`: Create a new agent
  - `agent:get`: Get an agent by ID
  - `agent:list`: List all agents
  - `agent:update`: Update an agent
  - `agent:delete`: Delete an agent
  - `agent:run`: Run an agent with a task

- **Task Events**
  - `task:create`: Create a new task
  - `task:get`: Get a task by ID
  - `task:list`: List all tasks
  - `task:update`: Update a task
  - `task:delete`: Delete a task
  - `task:getNext`: Get the next available task
  - `task:addDependency`: Add a dependency between tasks
  - `task:removeDependency`: Remove a dependency between tasks

- **Tool Events**
  - `tool:list`: List all available tools
  - `tool:execute`: Execute a tool

### CLI

The CLI client can be installed globally:

```bash
cd src/clients/cli
npm install -g
```

Usage:

```bash
unified-mcp --help
```

## Client Libraries

### TypeScript/JavaScript Client

```javascript
import { UnifiedMCPClient } from 'unified-mcp-client';

const client = new UnifiedMCPClient({
  baseUrl: 'http://localhost:3001',
  apiKey: 'your-api-key',
  websocket: true
});

// Create an agent
const agent = await client.createAgent({
  name: 'My Agent',
  description: 'A test agent'
});

// Create a task
const task = await client.createTask(
  'My Task',
  'A test task'
);

// Run the agent with the task
const result = await client.runAgent(agent.id, 'Perform the task');

// Close the client connection
client.close();
```

### Python Client

```python
from unified_mcp_client import UnifiedMCPClient

client = UnifiedMCPClient(
    base_url='http://localhost:3001',
    api_key='your-api-key',
    websocket=True
)

# Create an agent
agent = client.create_agent({
    'name': 'My Agent',
    'description': 'A test agent'
})

# Create a task
task = client.create_task(
    'My Task',
    'A test task'
)

# Run the agent with the task
result = client.run_agent(agent['id'], 'Perform the task')

# Close the client connection
client.close()
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

