// tool/src/config/config-mgr.js
import chalk from 'chalk';
import { cosmiconfigSync } from 'cosmiconfig';
import schema from './schema.json' assert { type: 'json' };
import betterAjvErrors from 'better-ajv-errors';
import Ajv from 'ajv';

const ajv = new Ajv({ jsonPointers: true });
const configLoader = cosmiconfigSync('tool');

export function getConfig() {
  const result = configLoader.search(process.cwd());
  if (!result) {
    console.log(chalk.yellow('Could not find configuration, using default'));
    return { port: 1234 };
  } else {
    const isValid = ajv.validate(schema, result.config);
    if (!isValid) {
      console.log(chalk.yellow('Invalid configuration was supplied'));
      console.log();
      console.log(betterAjvErrors(schema, result.config, ajv.errors));
      process.exit(1);
    }
    console.log('Found configuration', result.config);
    return result.config;
  }
}
