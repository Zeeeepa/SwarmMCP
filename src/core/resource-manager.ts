import { FastMCP } from 'fastmcp';
import { LRUCache } from 'lru-cache';
import logger from '../utils/logger';
import { ErrorHandler } from '../utils/error-handler';

/**
 * Interface for resource configuration
 */
export interface ResourceConfig {
  id?: string;
  type: string;
  name?: string;
  description?: string;
  [key: string]: any;
}

/**
 * Interface for resource template configuration
 */
export interface ResourceTemplateConfig {
  id?: string;
  type: string;
  name?: string;
  description?: string;
  [key: string]: any;
}

/**
 * Resource manager for handling MCP resources
 */
export class ResourceManager {
  private server: FastMCP;
  private resourceCache: LRUCache<string, ResourceConfig>;
  private templateCache: LRUCache<string, ResourceTemplateConfig>;

  /**
   * Create a new resource manager
   * @param server - FastMCP server instance
   */
  constructor(server: FastMCP) {
    this.server = server;
    
    // Initialize caches
    this.resourceCache = new LRUCache({
      max: 1000, // Maximum number of items to store
      ttl: 1000 * 60 * 60, // 1 hour TTL
    });
    
    this.templateCache = new LRUCache({
      max: 100, // Maximum number of templates to store
      ttl: 1000 * 60 * 60 * 24, // 24 hour TTL for templates
    });
  }

  /**
   * Add a resource to the server
   * @param resource - Resource configuration
   * @returns The added resource
   */
  addResource(resource: ResourceConfig): ResourceConfig {
    try {
      logger.debug(`Adding resource: ${JSON.stringify(resource)}`);
      
      // Add resource to server
      const addedResource = this.server.addResource(resource);
      
      // Cache the resource if it has an ID
      if (addedResource.id) {
        this.resourceCache.set(addedResource.id, addedResource);
      }
      
      logger.info(`Resource added: ${addedResource.id || 'unknown'}`);
      return addedResource;
    } catch (error) {
      logger.error(`Failed to add resource: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Add a resource template to the server
   * @param template - Resource template configuration
   * @returns The added template
   */
  addResourceTemplate(template: ResourceTemplateConfig): ResourceTemplateConfig {
    try {
      logger.debug(`Adding resource template: ${JSON.stringify(template)}`);
      
      // Add template to server
      const addedTemplate = this.server.addResourceTemplate(template);
      
      // Cache the template if it has an ID
      if (addedTemplate.id) {
        this.templateCache.set(addedTemplate.id, addedTemplate);
      }
      
      logger.info(`Resource template added: ${addedTemplate.id || 'unknown'}`);
      return addedTemplate;
    } catch (error) {
      logger.error(`Failed to add resource template: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Get a resource by ID
   * @param id - Resource ID
   * @returns The resource or undefined if not found
   */
  getResource(id: string): ResourceConfig | undefined {
    return this.resourceCache.get(id);
  }

  /**
   * Get a resource template by ID
   * @param id - Template ID
   * @returns The template or undefined if not found
   */
  getResourceTemplate(id: string): ResourceTemplateConfig | undefined {
    return this.templateCache.get(id);
  }

  /**
   * Remove a resource by ID
   * @param id - Resource ID
   */
  removeResource(id: string): void {
    if (!this.resourceCache.has(id)) {
      throw ErrorHandler.createError(
        `Resource '${id}' not found`,
        404,
        'RESOURCE_NOT_FOUND'
      );
    }
    
    this.resourceCache.delete(id);
    logger.info(`Resource removed: ${id}`);
  }

  /**
   * Remove a resource template by ID
   * @param id - Template ID
   */
  removeResourceTemplate(id: string): void {
    if (!this.templateCache.has(id)) {
      throw ErrorHandler.createError(
        `Resource template '${id}' not found`,
        404,
        'TEMPLATE_NOT_FOUND'
      );
    }
    
    this.templateCache.delete(id);
    logger.info(`Resource template removed: ${id}`);
  }
}

export default ResourceManager;

