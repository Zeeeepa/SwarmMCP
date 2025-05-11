# Unified MCP Server

A unified Model Context Protocol (MCP) server implementation that combines the best aspects of both serv and SwarmMCP repositories.

## Features

- **Protocol Compliance**: Uses FastMCP library for MCP protocol compliance
- **Modular Architecture**: Adopts a modular architecture for extensibility
- **Plugin System**: Supports plugins for extending server functionality
- **Robust Error Handling**: Comprehensive error handling and logging
- **Resource Management**: Efficient resource management

## Installation

```bash
npm install
```

## Usage

### Starting the Server

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=3000
LOG_LEVEL=info
```

## Architecture

The server is built with a modular architecture:

- **Core**: Server initialization, configuration, and protocol handling
- **Middleware**: Request processing and validation
- **Tools**: Built-in tools and plugin system
- **Utils**: Utility functions and helpers

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

## License

MIT

