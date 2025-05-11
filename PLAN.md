# Merge Plan: serv + SwarmMCP

## Overview

This document outlines a high-level plan for merging the `serv` and `SwarmMCP` repositories into a single unified project. The merged project will combine the AI agent capabilities of `serv` with the task management and MCP server functionality of `SwarmMCP`.

## Project Analysis

### serv
- **Purpose**: AI Agent SDK for building LLM-powered SWE agents
- **Core Components**:
  - Agent core (FSM-based agent architecture)
  - Tool registry and execution system
  - Model providers (Anthropic Claude)
  - Execution environments (local, Docker, E2B)
  - Checkpointing and rollback system
  - Evaluation framework
- **Technology**: TypeScript, modular architecture
- **Strengths**: Robust agent architecture, tool execution system, multiple execution environments

### SwarmMCP
- **Purpose**: Task management system for AI-driven development with Claude
- **Core Components**:
  - MCP server implementation
  - Task management system
  - Project initialization and PRD parsing
  - Task dependency management
  - Cursor AI integration
- **Technology**: JavaScript, MCP protocol implementation
- **Strengths**: Task management, MCP protocol support, Cursor integration

## Merged Architecture

The merged project should combine the strengths of both repositories while maintaining a clean, modular architecture. The proposed structure is:

```
unified-project/
├── src/
│   ├── core/                  # Core agent functionality from serv
│   │   ├── Agent.ts           # Agent implementation
│   │   ├── AgentFSM.ts        # Finite state machine
│   │   ├── ModelClient.ts     # Model client abstraction
│   │   ├── ToolRegistry.ts    # Tool registry
│   │   └── ...
│   ├── tools/                 # Combined tools from both projects
│   │   ├── file/              # File operation tools
│   │   ├── bash/              # Shell execution tools
│   │   ├── task/              # Task management tools
│   │   └── ...
│   ├── providers/             # Model providers
│   │   ├── AnthropicProvider.ts
│   │   └── ...
│   ├── utils/                 # Utility functions
│   │   ├── CheckpointManager.ts
│   │   ├── ExecutionAdapters/
│   │   └── ...
│   ├── mcp/                   # MCP server implementation
│   │   ├── server.ts          # MCP server
│   │   ├── tools/             # MCP-specific tools
│   │   └── ...
│   ├── task-management/       # Task management system from SwarmMCP
│   │   ├── TaskManager.ts
│   │   ├── DependencyManager.ts
│   │   └── ...
│   └── eval/                  # Evaluation framework from serv
│       └── ...
├── bin/                       # CLI executables
│   ├── agent-cli.ts           # Agent CLI
│   └── task-master.ts         # Task management CLI
└── mcp-server/               # MCP server entry point
    └── server.ts
```

## Integration Strategy

### 1. Core Components Integration

- **Agent Core**: Use the TypeScript agent core from `serv` as the foundation
- **MCP Protocol**: Integrate the MCP server implementation from `SwarmMCP`
- **Task Management**: Incorporate the task management system from `SwarmMCP`

### 2. Tool Integration

- Maintain the tool architecture from `serv` (tool registry, execution)
- Add task management tools from `SwarmMCP` as a new category of tools
- Ensure all tools follow a consistent interface pattern

### 3. Execution Environments

- Keep the execution adapters from `serv` (local, Docker, E2B)
- Add support for MCP-based execution

### 4. CLI and Server Components

- Maintain both CLI interfaces:
  - Agent CLI for direct agent interactions
  - Task Master CLI for task management
- Provide a unified MCP server that exposes both agent and task management capabilities

## Implementation Plan

### Phase 1: Project Setup and Core Integration

1. Create a new repository with the TypeScript setup from `serv`
2. Port the core agent architecture from `serv`
3. Set up the basic project structure following the merged architecture

### Phase 2: MCP Server Integration

1. Integrate the MCP server implementation from `SwarmMCP`
2. Adapt it to work with the TypeScript architecture
3. Ensure it can communicate with the agent core

### Phase 3: Task Management Integration

1. Port the task management system from `SwarmMCP`
2. Integrate it with the agent core
3. Implement task management tools that work with the tool registry

### Phase 4: Tool Harmonization

1. Ensure all tools from both projects are available
2. Standardize the tool interfaces
3. Add new tools that leverage the combined capabilities

### Phase 5: CLI and Documentation

1. Implement the combined CLI interfaces
2. Create comprehensive documentation
3. Add examples showcasing the integrated functionality

## Component Responsibility Matrix

| Component | Primary Source | Integration Notes |
|-----------|---------------|-------------------|
| Agent Core | serv | Main agent architecture, FSM, tool execution |
| Tool Registry | serv | Extended with task management tools |
| Model Providers | serv | Maintain provider abstraction |
| Execution Environments | serv | Add MCP as an execution option |
| MCP Server | SwarmMCP | Adapt to TypeScript, integrate with agent core |
| Task Management | SwarmMCP | Port to TypeScript, integrate with agent |
| CLI Tools | Both | Maintain both interfaces with unified backend |
| Evaluation Framework | serv | Extend to evaluate task management |

## Benefits of the Merged Project

1. **Unified Agent Platform**: A single platform for both agent execution and task management
2. **Enhanced Capabilities**: Agents can manage tasks and projects more effectively
3. **Improved Developer Experience**: Single dependency for both agent and task management
4. **Consistent Interface**: Unified API and CLI for all functionality
5. **TypeScript Benefits**: Type safety across the entire codebase
6. **Expanded Tool Ecosystem**: Combined tools from both projects

## Migration Path for Existing Users

1. **serv Users**:
   - Update to the new package
   - Minimal code changes required for core agent functionality
   - New task management capabilities available as opt-in

2. **SwarmMCP Users**:
   - Update to the new package
   - MCP server functionality remains compatible
   - Gain access to enhanced agent capabilities

## Next Steps

1. Create a detailed technical specification for the merged project
2. Set up the new repository with the proposed structure
3. Begin implementation following the phased approach
4. Create migration guides for existing users of both projects

## Conclusion

Merging `serv` and `SwarmMCP` creates a powerful, unified platform for AI-driven development that combines robust agent capabilities with effective task management. The merged project will provide developers with a comprehensive toolkit for building and managing AI agents while maintaining compatibility with existing workflows.

