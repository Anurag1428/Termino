  // import chalk from 'chalk';
  // import { cosmiconfigSync } from 'cosmiconfig';
  // import schema from './schema.json' assert { type: 'json' };
  // import AjvPkg from 'ajv';
  // const Ajv = AjvPkg.default;
  // import { createLogger } from '../logger.js';

  // const logger = createLogger('config:mgr');
  // const ajv = new Ajv();

  // const configLoader = cosmiconfigSync('tool');

  // export function getConfig() {
  //   const result = configLoader.search(process.cwd());
  //   if (!result) {
  //     console.log(chalk.yellow('Could not find configuration, using default'));
  //     logger.warning('Could not find configuration, using default');
  //     return { port: 1234 };
  //   } else {
  //     const isValid = ajv.validate(schema, result.config);
  //     if (!isValid) {
  //       logger.warning('Invalid configuration was supplied');
  //       console.log(chalk.yellow('Invalid configuration was supplied'));
  //       console.log();
  //       console.log(ajv.errors);
  //       process.exit(1);
  //     }
  //     logger.debug('Found configuration', result.config);
  //     return result.config;
  //   }
  // }


  import chalk from 'chalk';
import { cosmiconfigSync } from 'cosmiconfig';
import schema from './schema.json' assert { type: 'json' };
import AjvPkg from 'ajv';
const Ajv = AjvPkg.default;
import { createLogger } from '../logger.js';

const logger = createLogger('config:mgr');
const ajv = new Ajv();

const configLoader = cosmiconfigSync('tool');

// Default configuration
const defaultConfig = {
  port: 6666,
  kimiApiKey: '',
  aiModel: 'moonshot-v1-8k',
  maxTokens: 600,
  temperature: 0.7,
  safeMode: true,
  showWelcome: true,
  enableColors: true
};

export function getConfig() {
  const result = configLoader.search(process.cwd());
  
  if (!result) {
    console.log(chalk.yellow('Could not find configuration, using default'));
    logger.warning('Could not find configuration, using default');
    return defaultConfig;
  } else {
    // Merge user config with defaults
    const mergedConfig = { ...defaultConfig, ...result.config };
    
    const isValid = ajv.validate(schema, mergedConfig);
    if (!isValid) {
      logger.warning('Invalid configuration was supplied');
      console.log(chalk.yellow('Invalid configuration was supplied'));
      console.log(chalk.red('Errors:'));
      ajv.errors.forEach(error => {
        console.log(chalk.red(`  - ${error.instancePath || 'root'}: ${error.message}`));
      });
      console.log(chalk.blue('\nUsing default configuration instead...'));
      return defaultConfig;
    }
    
    logger.debug('Found and validated configuration', mergedConfig);
    return mergedConfig;
  }
}