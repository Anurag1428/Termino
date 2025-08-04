import chalk from 'chalk';
import { cosmiconfigSync } from 'cosmiconfig';
import schema from './schema.json' assert { type: 'json' };
import AjvPkg from 'ajv';
const Ajv = AjvPkg.default;
import { createLogger } from '../logger.js';

const logger = createLogger('config:mgr');
const ajv = new Ajv();

const configLoader = cosmiconfigSync('tool');

export function getConfig() {
  const result = configLoader.search(process.cwd());
  if (!result) {
    console.log(chalk.yellow('Could not find configuration, using default'));
    logger.warning('Could not find configuration, using default');
    return { port: 1234 };
  } else {
    const isValid = ajv.validate(schema, result.config);
    if (!isValid) {
      logger.warning('Invalid configuration was supplied');
      console.log(chalk.yellow('Invalid configuration was supplied'));
      console.log();
      console.log(ajv.errors);
      process.exit(1);
    }
    logger.debug('Found configuration', result.config);
    return result.config;
  }
}
