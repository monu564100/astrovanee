import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()]
});

export const requestLogger = (req, _res, next) => {
  logger.info({ msg: 'request', method: req.method, url: req.url, ip: req.ip });
  next();
};
