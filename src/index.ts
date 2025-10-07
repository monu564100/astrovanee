import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import { logger, requestLogger } from './logger.js';
import { errorHandler } from './middleware/error.js';
import consultationRouter from './routes/consultation.js';
import messageRouter from './routes/messages.js';
import tokenRouter from './routes/token.js';

const app = express();
app.use(helmet());
app.use(cors({ origin: '*'})); // adjust in production
app.use(express.json());
app.use(requestLogger);

app.get('/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));
app.use('/consultations', consultationRouter);
app.use('/tokens', tokenRouter);
app.use('/messages', messageRouter);
app.use(errorHandler);

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  logger.info(`API listening on :${port}`);
});
