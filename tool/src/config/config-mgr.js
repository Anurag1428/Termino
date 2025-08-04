import chalk from 'chalk';
import { cosmiconfigSync } from 'cosmiconfig';
import Ajv from 'ajv';
import schema from './schema.json' assert { type: 'json' }; // fixed path ✅

const configLoader = cosmiconfigSync('tool');

const getConfig = () => {
  const result = configLoader.search(process.cwd());
  if (!result) {
    console.log(chalk.yellow('Could not find configuration, using default'));
    return { port: 1234 };
  } else {
    const ajv = new Ajv(); // also important — create an instance
    const validate = ajv.compile(schema);
    const isValid = validate(result.config);
    if (!isValid) {
      console.log(chalk.yellow('Invalid configuration was supplied'));
      console.log(validate.errors);
      process.exit(1);
    }
    console.log('Found configuration', result.config);
    return result.config;
  }
};

export { getConfig };
