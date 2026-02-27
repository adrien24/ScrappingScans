module.exports = {
  apps: [
    {
      name: 'scrappingscan',
      script: './dist/server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        DEEPL_API_KEY: '70f8425f-a5d4-b4a7-4292-11a930ec2107:fx',
      },
      env_file: '/home/hangover/ScrappingScans/.env',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
    {
      name: 'trim-logs',
      script: './scripts/trim-logs.sh',
      interpreter: 'bash',
      autorestart: false,
      cron_restart: '*/5 * * * *', // toutes les 5 minutes
      watch: false,
      out_file: '/dev/null',
      error_file: '/dev/null',
    },
    // {
    //   name: 'update-all-cron',
    //   script: './scripts/update-all.sh',
    //   interpreter: 'bash',
    //   autorestart: false,
    //   cron_restart: '0 */2 * * *', // toutes les 2 heures
    //   watch: false,
    //   out_file: './logs/update-all-pm2.log',
    //   error_file: './logs/update-all-pm2-error.log',
    //   log_date_format: 'YYYY-MM-DD HH:mm:ss',
    // },
  ],
}
