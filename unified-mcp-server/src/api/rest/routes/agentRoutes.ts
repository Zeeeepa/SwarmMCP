import { Router, Request, Response } from 'express';
import { AgentManager } from '../../../core/AgentManager';
import { logger } from '../../../utils/logger';

/**
 * Create agent routes
 * @param agentManager - Agent manager instance
 */
export function agentRoutes(agentManager: AgentManager): Router {
  const router = Router();

  /**
   * Create a new agent
   * POST /api/v1/agents
   */
  router.post('/', async (req: Request, res: Response) => {
    try {
      const { name, description, model, tools, systemPrompt, maxTokens, temperature } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Agent name is required' });
      }
      
      const agent = agentManager.createAgent({
        name,
        description,
        model,
        tools,
        systemPrompt,
        maxTokens,
        temperature
      });
      
      res.status(201).json(agent);
    } catch (error) {
      logger.error(`Error creating agent: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: 'Failed to create agent' });
    }
  });

  /**
   * Get all agents
   * GET /api/v1/agents
   */
  router.get('/', async (req: Request, res: Response) => {
    try {
      let filter = undefined;
      
      if (req.query.filter) {
        try {
          filter = JSON.parse(req.query.filter as string);
        } catch (error) {
          return res.status(400).json({ error: 'Invalid filter format' });
        }
      }
      
      const agents = agentManager.listAgents(filter);
      res.json(agents);
    } catch (error) {
      logger.error(`Error listing agents: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: 'Failed to list agents' });
    }
  });

  /**
   * Get an agent by ID
   * GET /api/v1/agents/:id
   */
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const agent = agentManager.getAgent(req.params.id);
      
      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }
      
      res.json(agent);
    } catch (error) {
      logger.error(`Error getting agent: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: 'Failed to get agent' });
    }
  });

  /**
   * Update an agent
   * PUT /api/v1/agents/:id
   */
  router.put('/:id', async (req: Request, res: Response) => {
    try {
      const agent = agentManager.getAgent(req.params.id);
      
      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }
      
      const updatedAgent = agentManager.updateAgent(req.params.id, req.body);
      res.json(updatedAgent);
    } catch (error) {
      logger.error(`Error updating agent: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: 'Failed to update agent' });
    }
  });

  /**
   * Delete an agent
   * DELETE /api/v1/agents/:id
   */
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const agent = agentManager.getAgent(req.params.id);
      
      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }
      
      const success = agentManager.deleteAgent(req.params.id);
      
      if (success) {
        res.status(204).end();
      } else {
        res.status(500).json({ error: 'Failed to delete agent' });
      }
    } catch (error) {
      logger.error(`Error deleting agent: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: 'Failed to delete agent' });
    }
  });

  /**
   * Run an agent with a task
   * POST /api/v1/agents/:id/run
   */
  router.post('/:id/run', async (req: Request, res: Response) => {
    try {
      const agent = agentManager.getAgent(req.params.id);
      
      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }
      
      if (!req.body.task) {
        return res.status(400).json({ error: 'Task is required' });
      }
      
      const result = await agentManager.runAgent(req.params.id, req.body.task);
      res.json(result);
    } catch (error) {
      logger.error(`Error running agent: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: 'Failed to run agent' });
    }
  });

  return router;
}

