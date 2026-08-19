const http = require('node:http');
const app = require('./src/app');
const { connectDatabase, disconnectDatabase } = require('./src/config/db');
const { env, assertEnvironment } = require('./src/config/env');

let server;

async function start() {
  assertEnvironment();
  await connectDatabase();
  server = http.createServer(app);
  server.listen(env.port, () => {
    console.log(`Setu API listening on http://localhost:${env.port}`);
  });
}

async function shutdown(signal) {
  console.log(`${signal} received; shutting down Setu API`);
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await disconnectDatabase();
  process.exit(0);
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

start().catch((error) => {
  console.error(`Unable to start Setu API: ${error.message}`);
  process.exit(1);
});
