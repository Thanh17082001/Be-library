121708;
import * as winston from 'winston';

import * as moment from 'moment-timezone';

const isProduction = process.env.NODE_ENV === 'production';

export const winstonLoggerConfig = {
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.timestamp(), winston.format.colorize(), winston.format.simple()),
    }),
    ...(isProduction
      ? [
          new winston.transports.File({
            filename: 'application.log',
            format: winston.format.combine(
              winston.format.timestamp({
                format: () => moment().tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss'),
              }),
              winston.format.json()
            ),
            level: 'error', // Chỉ ghi log mức độ 'error' trong môi trường production
          }),
        ]
      : []),
  ],
};
