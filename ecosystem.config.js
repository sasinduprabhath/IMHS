module.exports = {
  apps: [
    {
      name: "imhs-portal",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3020",
      instances: "max", // Uses all available CPU cores (cluster mode) or set to 1/2 for smaller VPS
      exec_mode: "cluster",
      cwd: "/home/imhsedu.com/public_html", // Update to match your server website path
      env: {
        NODE_ENV: "production",
        PORT: 3020,
      },
      max_memory_restart: "1G",
      restart_delay: 3000,
      max_restarts: 10,
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      merge_logs: true,
      time: true,
    },
  ],
};
