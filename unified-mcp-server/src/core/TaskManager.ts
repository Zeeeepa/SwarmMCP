import { AgentManager } from './AgentManager';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

/**
 * Interface for task status
 */
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'blocked';

/**
 * Interface for task definition
 */
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  dependencies: string[];
  subtasks: string[];
  assignedAgentId?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

/**
 * Manager for tasks in the unified MCP server
 * Adapts functionality from the SwarmMCP repository
 */
export class TaskManager {
  private tasks: Map<string, Task> = new Map();
  private agentManager: AgentManager;

  constructor(agentManager: AgentManager) {
    this.agentManager = agentManager;
  }

  /**
   * Initialize the task manager
   */
  public async init(): Promise<void> {
    try {
      logger.info('Initializing Task Manager...');
      logger.info('Task Manager initialized successfully');
    } catch (error) {
      logger.error(`Failed to initialize Task Manager: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Create a new task
   * @param title - The task title
   * @param description - The task description
   * @param dependencies - Optional array of task IDs this task depends on
   */
  public createTask(title: string, description: string, dependencies: string[] = []): Task {
    const id = uuidv4();
    const now = new Date();
    
    const task: Task = {
      id,
      title,
      description,
      status: 'pending',
      dependencies,
      subtasks: [],
      createdAt: now,
      updatedAt: now
    };
    
    this.tasks.set(id, task);
    logger.info(`Created task: ${id} (${title})`);
    
    return task;
  }

  /**
   * Get a task by ID
   * @param id - The task ID
   */
  public getTask(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  /**
   * List all tasks
   * @param filter - Optional filter criteria
   */
  public listTasks(filter?: Partial<Task>): Task[] {
    const tasks = Array.from(this.tasks.values());
    
    if (!filter) {
      return tasks;
    }
    
    return tasks.filter(task => {
      for (const [key, value] of Object.entries(filter)) {
        if (key in task && task[key as keyof Task] !== value) {
          return false;
        }
      }
      return true;
    });
  }

  /**
   * Update a task
   * @param taskId - The task ID
   * @param updates - The updates to apply
   */
  public updateTask(taskId: string, updates: Partial<Task>): Task {
    const task = this.getTask(taskId);
    
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }
    
    // Don't allow updating id or timestamps directly
    const { id, createdAt, ...allowedUpdates } = updates as any;
    
    const updatedTask: Task = {
      ...task,
      ...allowedUpdates,
      updatedAt: new Date()
    };
    
    // If status is being updated to completed, set completedAt
    if (updates.status === 'completed' && task.status !== 'completed') {
      updatedTask.completedAt = new Date();
    }
    
    this.tasks.set(taskId, updatedTask);
    logger.info(`Updated task: ${taskId}`);
    
    return updatedTask;
  }

  /**
   * Delete a task
   * @param taskId - The task ID
   */
  public deleteTask(taskId: string): boolean {
    const exists = this.tasks.has(taskId);
    
    if (exists) {
      // Remove this task from any dependencies lists
      for (const task of this.tasks.values()) {
        if (task.dependencies.includes(taskId)) {
          const updatedDependencies = task.dependencies.filter(id => id !== taskId);
          this.updateTask(task.id, { dependencies: updatedDependencies });
        }
        
        if (task.subtasks.includes(taskId)) {
          const updatedSubtasks = task.subtasks.filter(id => id !== taskId);
          this.updateTask(task.id, { subtasks: updatedSubtasks });
        }
      }
      
      this.tasks.delete(taskId);
      logger.info(`Deleted task: ${taskId}`);
    }
    
    return exists;
  }

  /**
   * Add a dependency between tasks
   * @param taskId - The dependent task ID
   * @param dependsOnTaskId - The task ID that is depended on
   */
  public addDependency(taskId: string, dependsOnTaskId: string): Task {
    const task = this.getTask(taskId);
    const dependsOnTask = this.getTask(dependsOnTaskId);
    
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }
    
    if (!dependsOnTask) {
      throw new Error(`Dependency task not found: ${dependsOnTaskId}`);
    }
    
    // Check for circular dependencies
    if (this.wouldCreateCircularDependency(taskId, dependsOnTaskId)) {
      throw new Error(`Adding this dependency would create a circular dependency`);
    }
    
    // Add dependency if it doesn't already exist
    if (!task.dependencies.includes(dependsOnTaskId)) {
      const updatedDependencies = [...task.dependencies, dependsOnTaskId];
      return this.updateTask(taskId, { dependencies: updatedDependencies });
    }
    
    return task;
  }

  /**
   * Remove a dependency between tasks
   * @param taskId - The dependent task ID
   * @param dependsOnTaskId - The task ID that is depended on
   */
  public removeDependency(taskId: string, dependsOnTaskId: string): Task {
    const task = this.getTask(taskId);
    
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }
    
    // Remove dependency if it exists
    if (task.dependencies.includes(dependsOnTaskId)) {
      const updatedDependencies = task.dependencies.filter(id => id !== dependsOnTaskId);
      return this.updateTask(taskId, { dependencies: updatedDependencies });
    }
    
    return task;
  }

  /**
   * Add a subtask to a parent task
   * @param parentTaskId - The parent task ID
   * @param subtaskId - The subtask ID
   */
  public addSubtask(parentTaskId: string, subtaskId: string): Task {
    const parentTask = this.getTask(parentTaskId);
    const subtask = this.getTask(subtaskId);
    
    if (!parentTask) {
      throw new Error(`Parent task not found: ${parentTaskId}`);
    }
    
    if (!subtask) {
      throw new Error(`Subtask not found: ${subtaskId}`);
    }
    
    // Add subtask if it doesn't already exist
    if (!parentTask.subtasks.includes(subtaskId)) {
      const updatedSubtasks = [...parentTask.subtasks, subtaskId];
      return this.updateTask(parentTaskId, { subtasks: updatedSubtasks });
    }
    
    return parentTask;
  }

  /**
   * Remove a subtask from a parent task
   * @param parentTaskId - The parent task ID
   * @param subtaskId - The subtask ID
   */
  public removeSubtask(parentTaskId: string, subtaskId: string): Task {
    const parentTask = this.getTask(parentTaskId);
    
    if (!parentTask) {
      throw new Error(`Parent task not found: ${parentTaskId}`);
    }
    
    // Remove subtask if it exists
    if (parentTask.subtasks.includes(subtaskId)) {
      const updatedSubtasks = parentTask.subtasks.filter(id => id !== subtaskId);
      return this.updateTask(parentTaskId, { subtasks: updatedSubtasks });
    }
    
    return parentTask;
  }

  /**
   * Assign a task to an agent
   * @param taskId - The task ID
   * @param agentId - The agent ID
   */
  public assignTaskToAgent(taskId: string, agentId: string): Task {
    const task = this.getTask(taskId);
    const agent = this.agentManager.getAgent(agentId);
    
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }
    
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }
    
    return this.updateTask(taskId, { assignedAgentId: agentId });
  }

  /**
   * Get the next available task based on dependencies
   */
  public getNextTask(): Task | undefined {
    // Find tasks that are pending and have no dependencies or all dependencies are completed
    const availableTasks = Array.from(this.tasks.values()).filter(task => {
      if (task.status !== 'pending') {
        return false;
      }
      
      // Check if all dependencies are completed
      return task.dependencies.every(depId => {
        const depTask = this.getTask(depId);
        return depTask && depTask.status === 'completed';
      });
    });
    
    // Sort by creation date (oldest first)
    availableTasks.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    
    return availableTasks[0];
  }

  /**
   * Check if adding a dependency would create a circular dependency
   * @param taskId - The dependent task ID
   * @param dependsOnTaskId - The task ID that is depended on
   */
  private wouldCreateCircularDependency(taskId: string, dependsOnTaskId: string): boolean {
    // If the dependency task depends on the original task, it would create a cycle
    if (taskId === dependsOnTaskId) {
      return true;
    }
    
    const visited = new Set<string>();
    const stack = [dependsOnTaskId];
    
    while (stack.length > 0) {
      const currentTaskId = stack.pop()!;
      
      if (currentTaskId === taskId) {
        return true;
      }
      
      if (!visited.has(currentTaskId)) {
        visited.add(currentTaskId);
        
        const currentTask = this.getTask(currentTaskId);
        if (currentTask) {
          stack.push(...currentTask.dependencies);
        }
      }
    }
    
    return false;
  }
}

