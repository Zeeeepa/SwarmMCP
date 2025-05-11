import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger';

/**
 * Configuration Manager for the Unified MCP Server
 * Handles loading and managing configuration settings
 */
export class ConfigManager {
  private config: Record<string, any> = {};
  private version: string = '0.1.0';

  constructor() {
    // Initialize with default configuration
    this.config = {
      server: {
        port: process.env.PORT || 3000,
        host: process.env.HOST || 'localhost',
        cors: {
          enabled: process.env.CORS_ENABLED === 'true',
          origin: process.env.CORS_ORIGIN || '*'
        }
      },
      api: {
        rest: {
          enabled: true,
          port: process.env.REST_API_PORT || 3001
        },
        websocket: {
          enabled: true,
          port: process.env.WS_API_PORT || 3002
        },
        cli: {
          enabled: true
        },
        mcp: {
          enabled: true
        }
      },
      security: {
        jwt: {
          secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
          expiresIn: process.env.JWT_EXPIRES_IN || '1d'
        },
        rateLimiting: {
          enabled: process.env.RATE_LIMITING_ENABLED === 'true',
          windowMs: parseInt(process.env.RATE_LIMITING_WINDOW_MS || '60000', 10),
          max: parseInt(process.env.RATE_LIMITING_MAX || '100', 10)
        }
      },
      integrations: {
        cursorAI: {
          enabled: process.env.CURSOR_AI_INTEGRATION_ENABLED === 'true'
        }
      },
      logging: {
        level: process.env.LOG_LEVEL || 'info',
        file: process.env.LOG_FILE_ENABLED === 'true'
      }
    };
  }

  /**
   * Initialize the configuration manager
   */
  public async init(): Promise<void> {
    try {
      // Try to load version from package.json
      try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const packagePath = path.join(__dirname, '../../package.json');
        
        if (fs.existsSync(packagePath)) {
          const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
          this.version = packageJson.version;
        }
      } catch (error) {
        logger.warn(`Could not load version from package.json: ${error instanceof Error ? error.message : String(error)}`);
      }

      // Load custom configuration file if specified
      const configPath = process.env.CONFIG_PATH;
      if (configPath && fs.existsSync(configPath)) {
        try {
          const customConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
          this.mergeConfig(customConfig);
          logger.info(`Loaded custom configuration from ${configPath}`);
        } catch (error) {
          logger.error(`Error loading custom configuration: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      logger.info('Configuration manager initialized successfully');
    } catch (error) {
      logger.error(`Failed to initialize configuration manager: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Get the server version
   */
  public getVersion(): string {
    return this.version;
  }

  /**
   * Get a configuration value by key
   * @param key - The configuration key (dot notation supported)
   * @param defaultValue - Default value if key not found
   */
  public get<T>(key: string, defaultValue?: T): T {
    const keys = key.split('.');
    let value: any = this.config;

    for (const k of keys) {
      if (value === undefined || value === null) {
        return defaultValue as T;
      }
      value = value[k];
    }

    return (value === undefined || value === null) ? defaultValue as T : value;
  }

  /**
   * Set a configuration value
   * @param key - The configuration key (dot notation supported)
   * @param value - The value to set
   */
  public set<T>(key: string, value: T): void {
    const keys = key.split('.');
    let current: any = this.config;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (current[k] === undefined) {
        current[k] = {};
      }
      current = current[k];
    }

    current[keys[keys.length - 1]] = value;
  }

  /**
   * Merge a configuration object with the current configuration
   * @param config - The configuration object to merge
   */
  private mergeConfig(config: Record<string, any>): void {
    this.config = this.deepMerge(this.config, config);
  }

  /**
   * Deep merge two objects
   * @param target - The target object
   * @param source - The source object
   */
  private deepMerge(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
    const output = { ...target };

    for (const key in source) {
      if (source[key] instanceof Object && key in target && target[key] instanceof Object) {
        output[key] = this.deepMerge(target[key], source[key]);
      } else {
        output[key] = source[key];
      }
    }

    return output;
  }
}

