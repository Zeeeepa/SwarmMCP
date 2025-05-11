module.exports = {
  apps: [
    {
      name: 'unified-mcp-server',
      script: 'swarmmcp/mcp-server/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0',
        LOG_LEVEL: 'info',
        LOG_FORMAT: 'json',
        ENABLE_METRICS: 'true',
        METRICS_PATH: '/metrics'
      }
    }
  ]
};

