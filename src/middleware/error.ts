import { NextFunction, Request, Response } from 'express';
import { logger } from '../logger.js';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  logger.error({ msg: err.message, stack: err.stack });
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
}
