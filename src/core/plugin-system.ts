import { FastMCP } from 'fastmcp';
import logger from '../utils/logger';
import { ErrorHandler } from '../utils/error-handler';

/**
 * Interface for plugin configuration
 */
export interface PluginConfig {
  name: string;
  version: string;
  description?: string;
  [key: string]: any;
}

/**
 * Interface for MCP server plugin
 */
export interface Plugin {
  name: string;
  version: string;
  description?: string;
  register: (server: FastMCP, options?: Record<string, any>) => Promise<void> | void;
}

/**
 * Plugin system for extending server functionality
 */
export class PluginSystem {
  private plugins: Map<string, Plugin>;
  private server: FastMCP;

  /**
   * Create a new plugin system
   * @param server - FastMCP server instance
   */
  constructor(server: FastMCP) {
    this.plugins = new Map();
    this.server = server;
  }

  /**
   * Register a plugin with the server
   * @param plugin - Plugin to register
   * @param options - Plugin options
   */
  async registerPlugin(plugin: Plugin, options?: Record<string, any>): Promise<void> {
    try {
      // Check if plugin is already registered
      if (this.plugins.has(plugin.name)) {
        throw ErrorHandler.createError(
          `Plugin '${plugin.name}' is already registered`,
          400,
          'PLUGIN_ALREADY_REGISTERED'
        );
      }

      // Register plugin
      logger.info(`Registering plugin: ${plugin.name} v${plugin.version}`);
      await plugin.register(this.server, options);
      this.plugins.set(plugin.name, plugin);
      logger.info(`Plugin registered: ${plugin.name}`);
    } catch (error) {
      logger.error(`Failed to register plugin '${plugin.name}': ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Unregister a plugin from the server
   * @param pluginName - Name of the plugin to unregister
   */
  unregisterPlugin(pluginName: string): void {
    if (!this.plugins.has(pluginName)) {
      throw ErrorHandler.createError(
        `Plugin '${pluginName}' is not registered`,
        404,
        'PLUGIN_NOT_FOUND'
      );
    }

    this.plugins.delete(pluginName);
    logger.info(`Plugin unregistered: ${pluginName}`);
  }

  /**
   * Get a registered plugin by name
   * @param pluginName - Name of the plugin to get
   * @returns The plugin instance
   */
  getPlugin(pluginName: string): Plugin | undefined {
    return this.plugins.get(pluginName);
  }

  /**
   * Get all registered plugins
   * @returns Array of registered plugins
   */
  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }
}

export default PluginSystem;

