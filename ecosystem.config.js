module.exports = {
  apps: [{
    name: 'wantweb',
    script: 'server.js',
    cwd: '/www/wwwroot/wantweb/.next/standalone',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOSTNAME: '0.0.0.0',
      DATABASE_URL: 'postgresql://postgres:!Wantao9191@localhost:5432/wantapp',
      NEXTAUTH_SECRET: "5C345F277F4A2996678DBEE5751812AL",
      JWT_SECRET: "v4xCufXu4s",
      API_SECRET_KEY: "v4xCufXu4s",
      DATA_ENCRYPTION_KEY: "6MtTCD3v4_rladjXFdBREdaW4O6T248JR7Dr3Wu4wY4",
      CLOUD_DISK_PATH: "/www/wwwroot/uploads",
      MAX_FILE_SIZE: "104857600",
      ALLOWED_FILE_TYPES: "image/jpeg,image/png,image/gif,application/pdf,"
    },
    error_file: '/var/log/pm2/wantweb-error.log',
    out_file: '/var/log/pm2/wantweb-out.log',
    log_file: '/var/log/pm2/wantweb.log',
    time: true
  }]
};
