import 'dotenv/config';
import { startServer } from './src/index.js';
import { logger } from './src/logger.js';
import { initSignaling } from './src/signaling/socket.js';

const server = startServer();
// Initialize WebSocket signaling for call invites/accept/end
initSignaling(server);

function shutdown(signal) {
  logger.info({ msg: 'shutdown signal received', signal });
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
  // force exit after timeout
  setTimeout(() => process.exit(1), 10000).unref();
}

['SIGINT','SIGTERM'].forEach(sig => process.on(sig, () => shutdown(sig)));
