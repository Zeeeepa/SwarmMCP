import { z } from 'zod';

/**
 * Server configuration schema
 */
export const serverConfigSchema = z.object({
  // Server information
  name: z.string().default('Unified MCP Server'),
  version: z.string().default('0.1.0'),
  description: z.string().optional(),
  
  // Server options
  port: z.number().int().positive().default(3000),
  host: z.string().default('localhost'),
  
  // Transport options
  transport: z.enum(['http', 'stdio', 'websocket']).default('http'),
  
  // Timeout options
  timeout: z.number().int().positive().default(60000), // Default: 60 seconds
  
  // Logging options
  logLevel: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
  
  // Security options
  cors: z.boolean().default(true),
  helmet: z.boolean().default(true),
  
  // Resource options
  maxResources: z.number().int().positive().default(1000),
  maxTemplates: z.number().int().positive().default(100),
});

/**
 * Server configuration type
 */
export type ServerConfig = z.infer<typeof serverConfigSchema>;

/**
 * Default server configuration
 */
export const defaultConfig: ServerConfig = {
  name: 'Unified MCP Server',
  version: '0.1.0',
  port: 3000,
  host: 'localhost',
  transport: 'http',
  timeout: 60000,
  logLevel: 'info',
  cors: true,
  helmet: true,
  maxResources: 1000,
  maxTemplates: 100,
};

/**
 * Create a server configuration by merging with defaults
 * @param config - Partial server configuration
 * @returns Complete server configuration
 */
export function createServerConfig(config: Partial<ServerConfig> = {}): ServerConfig {
  return serverConfigSchema.parse({
    ...defaultConfig,
    ...config,
  });
}

export default {
  createServerConfig,
  defaultConfig,
  serverConfigSchema,
};

