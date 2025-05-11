# Unified MCP Server Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                         Unified MCP Server                              │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────────────┐ │
│ │                 │ │                 │ │                             │ │
│ │   API Layer     │ │  MCP Protocol   │ │      Authentication &       │ │
│ │                 │ │   Handler       │ │      Authorization          │ │
│ │                 │ │                 │ │                             │ │
│ └────────┬────────┘ └────────┬────────┘ └─────────────┬───────────────┘ │
│          │                   │                        │                 │
│          └───────────────────┼────────────────────────┘                 │
│                              │                                          │
│                              ▼                                          │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │                                                                     │ │
│ │                        Request Router                               │ │
│ │                                                                     │ │
│ └───────────┬─────────────────────┬────────────────────┬─────────────┘ │
│             │                     │                    │               │
│             ▼                     ▼                    ▼               │
│ ┌───────────────────┐ ┌───────────────────┐ ┌──────────────────────┐  │
│ │                   │ │                   │ │                      │  │
│ │   Agent System    │ │ Task Management   │ │ Resource Management  │  │
│ │    (from serv)    │ │  (from SwarmMCP)  │ │                      │  │
│ │                   │ │                   │ │                      │  │
│ └─────────┬─────────┘ └─────────┬─────────┘ └──────────┬───────────┘  │
│           │                     │                      │              │
│           └─────────────────────┼──────────────────────┘              │
│                                 │                                     │
│                                 ▼                                     │
│ ┌─────────────────────────────────────────────────────────────────┐   │
│ │                                                                 │   │
│ │                        Tool Registry                            │   │
│ │                                                                 │   │
│ └─────────────────────────────────────────────────────────────────┘   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                         External Systems                                │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────────────┐ │
│ │                 │ │                 │ │                             │ │
│ │   LLM Providers │ │  Execution      │ │      Storage                │ │
│ │   (Anthropic,   │ │  Environments   │ │      Systems                │ │
│ │    OpenAI)      │ │  (Docker, E2B)  │ │                             │ │
│ │                 │ │                 │ │                             │ │
│ └─────────────────┘ └─────────────────┘ └─────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                         Client Applications                             │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────────────┐ │
│ │                 │ │                 │ │                             │ │
│ │   MCP Clients   │ │  REST API       │ │      CLI Tools              │ │
│ │   (Cursor, etc) │ │  Clients        │ │                             │ │
│ │                 │ │                 │ │                             │ │
│ └─────────────────┘ └─────────────────┘ └─────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Component Descriptions

### Unified MCP Server

The core server that integrates all components and provides a unified interface for clients.

#### API Layer

Provides RESTful APIs for clients to interact with the system.

#### MCP Protocol Handler

Handles the Model Context Protocol (MCP) communication with clients.

#### Authentication & Authorization

Manages user authentication and authorization for API access.

#### Request Router

Routes incoming requests to the appropriate subsystem based on the request type.

#### Agent System (from serv)

Manages AI agents, their lifecycle, and execution. Adapted from the `serv` codebase.

#### Task Management (from SwarmMCP)

Manages tasks, subtasks, and their dependencies. Adapted from the `SwarmMCP` codebase.

#### Resource Management

Manages resources that can be used by agents and tasks.

#### Tool Registry

Manages the tools that can be used by agents and tasks.

### External Systems

External systems that the Unified MCP Server interacts with.

#### LLM Providers

Language model providers like Anthropic and OpenAI that provide the AI capabilities.

#### Execution Environments

Environments where agent code can be executed, such as Docker containers or E2B sandboxes.

#### Storage Systems

Systems for storing data, such as file systems, databases, or object storage.

### Client Applications

Applications that interact with the Unified MCP Server.

#### MCP Clients

Clients that use the Model Context Protocol, such as Cursor.

#### REST API Clients

Clients that use the RESTful APIs provided by the server.

#### CLI Tools

Command-line tools for interacting with the server.

