import { Router, Request, Response } from 'express';
import { TaskManager } from '../../../core/TaskManager';
import { logger } from '../../../utils/logger';

/**
 * Create task routes
 * @param taskManager - Task manager instance
 */
export function taskRoutes(taskManager: TaskManager): Router {
  const router = Router();

  /**
   * Create a new task
   * POST /api/v1/tasks
   */
  router.post('/', async (req: Request, res: Response) => {
    try {
      const { title, description, dependencies } = req.body;
      
      if (!title) {
        return res.status(400).json({ error: 'Task title is required' });
      }
      
      if (!description) {
        return res.status(400).json({ error: 'Task description is required' });
      }
      
      const task = taskManager.createTask(
        title,
        description,
        dependencies || []
      );
      
      res.status(201).json(task);
    } catch (error) {
      logger.error(`Error creating task: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: 'Failed to create task' });
    }
  });

  /**
   * Get all tasks
   * GET /api/v1/tasks
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
      
      const tasks = taskManager.listTasks(filter);
      res.json(tasks);
    } catch (error) {
      logger.error(`Error listing tasks: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: 'Failed to list tasks' });
    }
  });

  /**
   * Get a task by ID
   * GET /api/v1/tasks/:id
   */
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const task = taskManager.getTask(req.params.id);
      
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      res.json(task);
    } catch (error) {
      logger.error(`Error getting task: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: 'Failed to get task' });
    }
  });

  /**
   * Update a task
   * PUT /api/v1/tasks/:id
   */
  router.put('/:id', async (req: Request, res: Response) => {
    try {
      const task = taskManager.getTask(req.params.id);
      
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      const updatedTask = taskManager.updateTask(req.params.id, req.body);
      res.json(updatedTask);
    } catch (error) {
      logger.error(`Error updating task: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: 'Failed to update task' });
    }
  });

  /**
   * Delete a task
   * DELETE /api/v1/tasks/:id
   */
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const task = taskManager.getTask(req.params.id);
      
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      const success = taskManager.deleteTask(req.params.id);
      
      if (success) {
        res.status(204).end();
      } else {
        res.status(500).json({ error: 'Failed to delete task' });
      }
    } catch (error) {
      logger.error(`Error deleting task: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: 'Failed to delete task' });
    }
  });

  /**
   * Get the next available task
   * GET /api/v1/tasks/next
   */
  router.get('/next', async (req: Request, res: Response) => {
    try {
      const task = taskManager.getNextTask();
      res.json(task || null);
    } catch (error) {
      logger.error(`Error getting next task: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: 'Failed to get next task' });
    }
  });

  /**
   * Add a dependency between tasks
   * POST /api/v1/tasks/:id/dependencies
   */
  router.post('/:id/dependencies', async (req: Request, res: Response) => {
    try {
      const { dependsOnTaskId } = req.body;
      
      if (!dependsOnTaskId) {
        return res.status(400).json({ error: 'Dependency task ID is required' });
      }
      
      const task = taskManager.getTask(req.params.id);
      
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      const dependsOnTask = taskManager.getTask(dependsOnTaskId);
      
      if (!dependsOnTask) {
        return res.status(404).json({ error: 'Dependency task not found' });
      }
      
      const updatedTask = taskManager.addDependency(req.params.id, dependsOnTaskId);
      res.json(updatedTask);
    } catch (error) {
      logger.error(`Error adding dependency: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: 'Failed to add dependency' });
    }
  });

  /**
   * Remove a dependency between tasks
   * DELETE /api/v1/tasks/:id/dependencies/:dependsOnId
   */
  router.delete('/:id/dependencies/:dependsOnId', async (req: Request, res: Response) => {
    try {
      const task = taskManager.getTask(req.params.id);
      
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      const updatedTask = taskManager.removeDependency(req.params.id, req.params.dependsOnId);
      res.json(updatedTask);
    } catch (error) {
      logger.error(`Error removing dependency: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: 'Failed to remove dependency' });
    }
  });

  /**
   * Add a subtask to a parent task
   * POST /api/v1/tasks/:id/subtasks
   */
  router.post('/:id/subtasks', async (req: Request, res: Response) => {
    try {
      const { subtaskId } = req.body;
      
      if (!subtaskId) {
        return res.status(400).json({ error: 'Subtask ID is required' });
      }
      
      const task = taskManager.getTask(req.params.id);
      
      if (!task) {
        return res.status(404).json({ error: 'Parent task not found' });
      }
      
      const subtask = taskManager.getTask(subtaskId);
      
      if (!subtask) {
        return res.status(404).json({ error: 'Subtask not found' });
      }
      
      const updatedTask = taskManager.addSubtask(req.params.id, subtaskId);
      res.json(updatedTask);
    } catch (error) {
      logger.error(`Error adding subtask: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: 'Failed to add subtask' });
    }
  });

  /**
   * Remove a subtask from a parent task
   * DELETE /api/v1/tasks/:id/subtasks/:subtaskId
   */
  router.delete('/:id/subtasks/:subtaskId', async (req: Request, res: Response) => {
    try {
      const task = taskManager.getTask(req.params.id);
      
      if (!task) {
        return res.status(404).json({ error: 'Parent task not found' });
      }
      
      const updatedTask = taskManager.removeSubtask(req.params.id, req.params.subtaskId);
      res.json(updatedTask);
    } catch (error) {
      logger.error(`Error removing subtask: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: 'Failed to remove subtask' });
    }
  });

  /**
   * Assign a task to an agent
   * POST /api/v1/tasks/:id/assign
   */
  router.post('/:id/assign', async (req: Request, res: Response) => {
    try {
      const { agentId } = req.body;
      
      if (!agentId) {
        return res.status(400).json({ error: 'Agent ID is required' });
      }
      
      const task = taskManager.getTask(req.params.id);
      
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      const updatedTask = taskManager.assignTaskToAgent(req.params.id, agentId);
      res.json(updatedTask);
    } catch (error) {
      logger.error(`Error assigning task: ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ error: 'Failed to assign task' });
    }
  });

  return router;
}

