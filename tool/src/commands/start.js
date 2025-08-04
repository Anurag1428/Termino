// src/commands/start.js
import chalk from 'chalk';
import { createLogger } from '../logger.js'; // Corrected import statement

const logger = createLogger('commands:start'); // Use the imported function

export function start(config) {
  logger.highlight('Starting the app :');
  logger.debug(chalk.gray('Received configuration in start -'), config);
}