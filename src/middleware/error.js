import { logger } from '../logger.js';

export function errorHandler(err, _req, res, _next) {
  logger.error({ msg: err.message, stack: err.stack });
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
}
