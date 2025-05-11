#!/usr/bin/env node

/**
 * Command-line interface for the Unified MCP Server
 */

const { program } = require('commander');
const axios = require('axios');
const chalk = require('chalk');
const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Configuration
const CONFIG_DIR = path.join(os.homedir(), '.unified-mcp');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

// Ensure config directory exists
if (!fs.existsSync(CONFIG_DIR)) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
}

// Load configuration
let config = {
  baseUrl: 'http://localhost:3001',
  apiKey: '',
};

if (fs.existsSync(CONFIG_FILE)) {
  try {
    config = { ...config, ...JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')) };
  } catch (error) {
    console.error(chalk.red(`Error loading configuration: ${error.message}`));
  }
}

// Save configuration
function saveConfig() {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error(chalk.red(`Error saving configuration: ${error.message}`));
  }
}

// Create HTTP client
function createClient() {
  return axios.create({
    baseURL: config.baseUrl,
    headers: {
      'Content-Type': 'application/json',
      ...(config.apiKey ? { 'Authorization': `Bearer ${config.apiKey}` } : {})
    }
  });
}

// Format output
function formatOutput(data, format = 'json') {
  if (format === 'json') {
    return JSON.stringify(data, null, 2);
  } else if (format === 'table') {
    // Simple table formatting for common data types
    if (Array.isArray(data)) {
      if (data.length === 0) {
        return 'No data';
      }
      
      const keys = Object.keys(data[0]);
      const header = keys.join('\t');
      const rows = data.map(item => keys.map(key => item[key]).join('\t'));
      
      return [header, ...rows].join('\n');
    } else if (typeof data === 'object' && data !== null) {
      return Object.entries(data)
        .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
        .join('\n');
    }
  }
  
  return String(data);
}

// Setup program
program
  .name('unified-mcp-cli')
  .description('Command-line interface for the Unified MCP Server')
  .version('0.1.0');

// Global options
program
  .option('-u, --url <url>', 'Base URL of the Unified MCP Server')
  .option('-k, --api-key <key>', 'API key for authentication')
  .option('-f, --format <format>', 'Output format (json or table)', 'json');

// Configure command
program
  .command('configure')
  .description('Configure the CLI')
  .action(async () => {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'baseUrl',
        message: 'Enter the base URL of the Unified MCP Server:',
        default: config.baseUrl
      },
      {
        type: 'input',
        name: 'apiKey',
        message: 'Enter your API key:',
        default: config.apiKey
      }
    ]);
    
    config = { ...config, ...answers };
    saveConfig();
    
    console.log(chalk.green('Configuration saved successfully'));
  });

// Health check command
program
  .command('health')
  .description('Check server health')
  .action(async (options, command) => {
    try {
      const client = createClient();
      const response = await client.get('/health');
      
      console.log(chalk.green('Server is healthy'));
      console.log(formatOutput(response.data, command.parent.format));
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Agent commands
const agentCommand = program
  .command('agent')
  .description('Manage agents');

agentCommand
  .command('create')
  .description('Create a new agent')
  .requiredOption('--name <name>', 'Name of the agent')
  .option('--description <description>', 'Description of the agent')
  .option('--model <model>', 'Model to use for the agent')
  .action(async (options, command) => {
    try {
      const client = createClient();
      const response = await client.post('/api/v1/agents', {
        name: options.name,
        description: options.description,
        model: options.model
      });
      
      console.log(chalk.green('Agent created successfully'));
      console.log(formatOutput(response.data, command.parent.parent.format));
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

agentCommand
  .command('list')
  .description('List all agents')
  .option('--filter <filter>', 'Filter criteria in JSON format')
  .action(async (options, command) => {
    try {
      const client = createClient();
      const params = {};
      
      if (options.filter) {
        try {
          params.filter = JSON.stringify(JSON.parse(options.filter));
        } catch (error) {
          console.error(chalk.red(`Invalid filter format: ${error.message}`));
          process.exit(1);
        }
      }
      
      const response = await client.get('/api/v1/agents', { params });
      
      console.log(formatOutput(response.data, command.parent.parent.format));
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

agentCommand
  .command('get')
  .description('Get an agent by ID')
  .requiredOption('--id <id>', 'ID of the agent')
  .action(async (options, command) => {
    try {
      const client = createClient();
      const response = await client.get(`/api/v1/agents/${options.id}`);
      
      console.log(formatOutput(response.data, command.parent.parent.format));
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

agentCommand
  .command('update')
  .description('Update an agent')
  .requiredOption('--id <id>', 'ID of the agent')
  .option('--name <name>', 'New name for the agent')
  .option('--description <description>', 'New description for the agent')
  .option('--model <model>', 'New model for the agent')
  .action(async (options, command) => {
    try {
      const client = createClient();
      const updates = {};
      
      if (options.name) updates.name = options.name;
      if (options.description) updates.description = options.description;
      if (options.model) updates.model = options.model;
      
      const response = await client.put(`/api/v1/agents/${options.id}`, updates);
      
      console.log(chalk.green('Agent updated successfully'));
      console.log(formatOutput(response.data, command.parent.parent.format));
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

agentCommand
  .command('delete')
  .description('Delete an agent')
  .requiredOption('--id <id>', 'ID of the agent')
  .action(async (options) => {
    try {
      const client = createClient();
      await client.delete(`/api/v1/agents/${options.id}`);
      
      console.log(chalk.green('Agent deleted successfully'));
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

agentCommand
  .command('run')
  .description('Run an agent with a task')
  .requiredOption('--id <id>', 'ID of the agent')
  .requiredOption('--task <task>', 'Task for the agent to perform')
  .action(async (options, command) => {
    try {
      const client = createClient();
      const response = await client.post(`/api/v1/agents/${options.id}/run`, {
        task: options.task
      });
      
      console.log(chalk.green('Agent task executed successfully'));
      console.log(formatOutput(response.data, command.parent.parent.format));
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Task commands
const taskCommand = program
  .command('task')
  .description('Manage tasks');

taskCommand
  .command('create')
  .description('Create a new task')
  .requiredOption('--title <title>', 'Title of the task')
  .requiredOption('--description <description>', 'Description of the task')
  .option('--dependencies <dependencies>', 'Comma-separated list of task IDs this task depends on')
  .action(async (options, command) => {
    try {
      const client = createClient();
      const dependencies = options.dependencies ? options.dependencies.split(',') : [];
      
      const response = await client.post('/api/v1/tasks', {
        title: options.title,
        description: options.description,
        dependencies
      });
      
      console.log(chalk.green('Task created successfully'));
      console.log(formatOutput(response.data, command.parent.parent.format));
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

taskCommand
  .command('list')
  .description('List all tasks')
  .option('--filter <filter>', 'Filter criteria in JSON format')
  .action(async (options, command) => {
    try {
      const client = createClient();
      const params = {};
      
      if (options.filter) {
        try {
          params.filter = JSON.stringify(JSON.parse(options.filter));
        } catch (error) {
          console.error(chalk.red(`Invalid filter format: ${error.message}`));
          process.exit(1);
        }
      }
      
      const response = await client.get('/api/v1/tasks', { params });
      
      console.log(formatOutput(response.data, command.parent.parent.format));
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

taskCommand
  .command('get')
  .description('Get a task by ID')
  .requiredOption('--id <id>', 'ID of the task')
  .action(async (options, command) => {
    try {
      const client = createClient();
      const response = await client.get(`/api/v1/tasks/${options.id}`);
      
      console.log(formatOutput(response.data, command.parent.parent.format));
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

taskCommand
  .command('update')
  .description('Update a task')
  .requiredOption('--id <id>', 'ID of the task')
  .option('--title <title>', 'New title for the task')
  .option('--description <description>', 'New description for the task')
  .option('--status <status>', 'New status for the task (pending, in_progress, completed, failed, blocked)')
  .action(async (options, command) => {
    try {
      const client = createClient();
      const updates = {};
      
      if (options.title) updates.title = options.title;
      if (options.description) updates.description = options.description;
      if (options.status) updates.status = options.status;
      
      const response = await client.put(`/api/v1/tasks/${options.id}`, updates);
      
      console.log(chalk.green('Task updated successfully'));
      console.log(formatOutput(response.data, command.parent.parent.format));
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

taskCommand
  .command('delete')
  .description('Delete a task')
  .requiredOption('--id <id>', 'ID of the task')
  .action(async (options) => {
    try {
      const client = createClient();
      await client.delete(`/api/v1/tasks/${options.id}`);
      
      console.log(chalk.green('Task deleted successfully'));
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

taskCommand
  .command('add-dependency')
  .description('Add a dependency between tasks')
  .requiredOption('--id <id>', 'ID of the dependent task')
  .requiredOption('--depends-on <dependsOnId>', 'ID of the task that is depended on')
  .action(async (options, command) => {
    try {
      const client = createClient();
      const response = await client.post(`/api/v1/tasks/${options.id}/dependencies`, {
        dependsOnTaskId: options.dependsOn
      });
      
      console.log(chalk.green('Dependency added successfully'));
      console.log(formatOutput(response.data, command.parent.parent.format));
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

taskCommand
  .command('remove-dependency')
  .description('Remove a dependency between tasks')
  .requiredOption('--id <id>', 'ID of the dependent task')
  .requiredOption('--depends-on <dependsOnId>', 'ID of the task that is depended on')
  .action(async (options, command) => {
    try {
      const client = createClient();
      const response = await client.delete(`/api/v1/tasks/${options.id}/dependencies/${options.dependsOn}`);
      
      console.log(chalk.green('Dependency removed successfully'));
      console.log(formatOutput(response.data, command.parent.parent.format));
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

taskCommand
  .command('next')
  .description('Get the next available task')
  .action(async (options, command) => {
    try {
      const client = createClient();
      const response = await client.get('/api/v1/tasks/next');
      
      if (response.data) {
        console.log(formatOutput(response.data, command.parent.parent.format));
      } else {
        console.log(chalk.yellow('No tasks available'));
      }
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Tool commands
const toolCommand = program
  .command('tool')
  .description('Manage tools');

toolCommand
  .command('list')
  .description('List all available tools')
  .action(async (options, command) => {
    try {
      const client = createClient();
      const response = await client.get('/api/v1/tools');
      
      console.log(formatOutput(response.data, command.parent.parent.format));
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

toolCommand
  .command('execute')
  .description('Execute a tool')
  .requiredOption('--name <name>', 'Name of the tool to execute')
  .option('--parameters <parameters>', 'Parameters for the tool in JSON format')
  .action(async (options, command) => {
    try {
      const client = createClient();
      let parameters = {};
      
      if (options.parameters) {
        try {
          parameters = JSON.parse(options.parameters);
        } catch (error) {
          console.error(chalk.red(`Invalid parameters format: ${error.message}`));
          process.exit(1);
        }
      }
      
      const response = await client.post(`/api/v1/tools/${options.name}/execute`, {
        parameters
      });
      
      console.log(chalk.green('Tool executed successfully'));
      console.log(formatOutput(response.data, command.parent.parent.format));
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse(process.argv);

// If no arguments provided, show help
if (process.argv.length <= 2) {
  program.help();
}

