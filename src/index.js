import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import { ping } from './db/pool.js';
import { logger, requestLogger } from './logger.js';
import { errorHandler } from './middleware/error.js';
import consultationRouter from './routes/consultation.js';
import messageRouter from './routes/messages.js';
import notificationRouter from './routes/notifications.js';
import tokenRouter from './routes/token.js';
import usersRouter from './routes/users.js';
import vendorRouter from './routes/vendors.js'; // Added vendorRouter import
import { initCallExpiryWatcher } from './services/callScheduler.js';

export const app = express();
app.use(helmet());
app.use(cors({ origin: '*' })); // tighten later
app.use(express.json());
app.use(requestLogger);

app.get('/health', async (_req, res, next) => {
  try {
    await ping();
    res.json({ ok: true, ts: Date.now() });
  } catch (e) {
    next(e);
  }
});

app.use('/consultations', consultationRouter);
app.use('/tokens', tokenRouter);
app.use('/messages', messageRouter);
app.use('/vendors', vendorRouter); // Added vendors route
app.use('/users', usersRouter);
app.use('/notifications', notificationRouter);
app.use(errorHandler);

export function startServer() {
  const port = Number(process.env.PORT || 4000);
  const host = '0.0.0.0'; // Listen on all network interfaces (allows external connections)
  const server = app.listen(port, host, () => {
    logger.info(`API listening on ${host}:${port}`);
    logger.info(`External access: http://<your-ip>:${port}`);
    initCallExpiryWatcher();
  });
  return server;
}
