// src/config/config-mgr.js
import { cosmiconfigSync } from 'cosmiconfig';
import chalk from 'chalk';

const configLoader = cosmiconfigSync('tool');
const getConfig = () => {
  const result = configLoader.search(process.cwd());
  if (!result) {
    console.log(chalk.yellow('Could not find configuration, using default'));
    return { port: 1234 };
  } else {
    console.log('Found configuration', result.config);
    return result.config;
  }
};

export { getConfig };