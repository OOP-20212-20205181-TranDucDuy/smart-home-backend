// import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
// import * as winston from 'winston';
// import DailyRotateFile from 'winston-daily-rotate-file';

// const logFormat = winston.format.printf(({ level, message, timestamp }) => {
//   return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
// });

// export const winstonConfig = {
//   level: 'info', // Set the desired log level
//   format: winston.format.combine(
//     winston.format.timestamp(),
//     logFormat,
//   ),
//   transports: [
//     new winston.transports.Console({
//       format: winston.format.combine(
//         winston.format.colorize(), // Add colorization for console logs
//         winston.format.timestamp(),
//         nestWinstonModuleUtilities.format.nestLike('MyApp', {
//             colors: true,
//             prettyPrint: true,
//           }),
//         logFormat,
//       ),
//     }),
//     new DailyRotateFile({
//       filename: 'logs/application-%DATE%.log',
//       datePattern: 'YYYY-MM-DD',
//       zippedArchive: true,
//       maxSize: '20m', // Max size of each log file
//       maxFiles: '14d', // Keep logs for 14 days
//       format: winston.format.combine(
//         winston.format.timestamp(),
//         logFormat,
//       ),
//     }),
//   ],
// };
