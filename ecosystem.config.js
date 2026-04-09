module.exports = {
  apps: [
    {
      name: "attendance-machine-portal",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3003",
      instances: 1,     
      exec_mode: "cluster",
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
      }
    }
  ]
}