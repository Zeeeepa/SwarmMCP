import { Router, Request, Response } from 'express';
import { ToolRegistry } from '../../../core/ToolRegistry';
import { logger } from '../../../utils/logger';

/**
 * Create tool routes
 * @param toolRegistry - Tool registry instance
 */
export function toolRoutes(toolRegistry: ToolRegistry): Router {
  const router = Router();

  /**
   * Get all tools
   * GET /api/v1/tools
   */
  router.get('/', async (req: Request, res: Response) => {
    try {
      const tools = toolRegistry.getAllTools();
      
      // Remove handler functions from response
      const sanitizedTools = tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters
      }));
      
      res.json(sanitizedTools);
    } catch (error) {
      logger.error(`Error listing tools: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: 'Failed to list tools' });
    }
  });

  /**
   * Get a tool by name
   * GET /api/v1/tools/:name
   */
  router.get('/:name', async (req: Request, res: Response) => {
    try {
      const tool = toolRegistry.getTool(req.params.name);
      
      if (!tool) {
        return res.status(404).json({ error: 'Tool not found' });
      }
      
      // Remove handler function from response
      const sanitizedTool = {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters
      };
      
      res.json(sanitizedTool);
    } catch (error) {
      logger.error(`Error getting tool: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: 'Failed to get tool' });
    }
  });

  /**
   * Execute a tool
   * POST /api/v1/tools/:name/execute
   */
  router.post('/:name/execute', async (req: Request, res: Response) => {
    try {
      const tool = toolRegistry.getTool(req.params.name);
      
      if (!tool) {
        return res.status(404).json({ error: 'Tool not found' });
      }
      
      const parameters = req.body.parameters || {};
      
      try {
        const result = await tool.handler(parameters);
        res.json(result);
      } catch (error) {
        logger.error(`Error executing tool ${req.params.name}: ${error instanceof Error ? error.message : String(error)}`);
        res.status(400).json({ error: `Tool execution failed: ${error instanceof Error ? error.message : String(error)}` });
      }
    } catch (error) {
      logger.error(`Error executing tool: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: 'Failed to execute tool' });
    }
  });

  return router;
}

