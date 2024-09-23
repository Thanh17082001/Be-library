import * as winston from 'winston';

const isProduction = process.env.NODE_ENV === 'production';

export const winstonLoggerConfig = {
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.colorize(),
                winston.format.simple(),
            ),
        }),
        // new winston.transports.Console({
        //     level: 'warn',
        //     format: winston.format.combine(
        //         winston.format.timestamp(),
        //         winston.format.colorize(),
        //         winston.format.simple(),
        //     ),
        //     handleExceptions: true, // Ghi log cho các ngoại lệ
        // }),
        new winston.transports.File({
            filename: 'application.log',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
            ),
            level: 'warn', // Chỉ ghi log mức độ cao hơn warn trong production
        }),
    ],
};
