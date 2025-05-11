# VoltAgent

A unified TypeScript agent framework combining the AI agent capabilities of `serv` with the task management and MCP server functionality of `SwarmMCP`.

## Features

- FSM-based agent architecture
- Tool registry and execution system
- Model providers (Anthropic Claude, OpenAI)
- Execution environments (local, Docker, E2B)
- Checkpointing and rollback system
- MCP server implementation
- Task management system
- Project initialization and PRD parsing
- Task dependency management

## Installation

```bash
npm install voltagent
```

## Usage

```typescript
import { Agent } from 'voltagent';
import { FileReadTool, FileWriteTool, BashTool } from 'voltagent/node/tools';
import { AnthropicProvider } from 'voltagent/node/providers';

// Create an agent with tools and model provider
const agent = new Agent({
  modelProvider: new AnthropicProvider({
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: 'claude-3-opus-20240229'
  }),
  tools: [
    new FileReadTool(),
    new FileWriteTool(),
    new BashTool()
  ]
});

// Run the agent with a prompt
const result = await agent.run('Create a simple Node.js server');
console.log(result);
```

## Testing

VoltAgent uses Jest for testing. The testing strategy includes unit tests, integration tests, end-to-end tests, and performance tests.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run end-to-end tests
npm run test:e2e

# Run performance tests
npm run test:performance
```

### Test Structure

- **Unit Tests**: Located in `__tests__` directories alongside source files
- **Integration Tests**: Located in `tests/integration`
- **End-to-End Tests**: Located in `tests/e2e`
- **Performance Tests**: Located in `tests/performance`

### Writing Tests

See the [Testing Strategy](docs/testing-strategy.md) document for detailed information on how to write tests for VoltAgent.

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Lint the code
npm run lint

# Format the code
npm run format

# Type check
npm run type-check
```

## License

MIT

