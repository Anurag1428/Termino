#!/usr/bin/env node
import arg from 'arg';
import chalk from 'chalk';
import { getConfig } from '../src/config/config-mgr.js';
import { start } from '../src/commands/start.js';
import { terminal } from '../src/commands/terminal.js';
// ⛔ Don't directly import aiHelp
// import { aiHelp } from '../src/commands/ai-help.js';

import { createLogger } from '../src/logger.js';
const logger = createLogger('bin');

// ✅ Clean up and exit safely on unhandled errors
process.on('uncaughtException', (err) => {
  console.error(chalk.red(`Uncaught Exception: ${err.message}`));
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error(chalk.red(`Unhandled Rejection: ${reason}`));
  process.exit(1);
});

function showWelcome() {
  console.log(chalk.cyan.bold(`
╔══════════════════════════════════════╗
║        🤖 AI Terminal Helper         ║
║     Making Terminal Easy for You!    ║
╚══════════════════════════════════════╝
  `));
}

function usage() {
  console.log(`${chalk.whiteBright('ait [CMD]')} - AI Terminal Helper

${chalk.greenBright('Commands:')}
${chalk.cyanBright('--terminal, -t')}\t🖥️  Start AI-enhanced terminal
${chalk.cyanBright('--help-ai, -h')}\t🤖  Get AI help with commands
${chalk.cyanBright('--start')}\t\t🚀  Start the original app
${chalk.cyanBright('--build')}\t\t🔧  Build the app

${chalk.yellowBright('Examples:')}
  ait --terminal     # Start interactive AI terminal
  ait -h             # Get AI command help
`);
}

// ✅ Convert to async to allow dynamic import
const run = async () => {
  try {
    const args = arg({
      '--start': Boolean,
      '--terminal': Boolean,
      '--help-ai': Boolean,
      '--build': Boolean,
      '-t': '--terminal',
      '-h': '--help-ai'
    });

    logger.debug('Received args', args);

    showWelcome();

    if (args['--terminal'] || args['-t']) {
      const config = getConfig();
      terminal(config);
    } else if (args['--help-ai'] || args['-h']) {
      try {
        const { aiHelp } = await import('../src/commands/ai-help.js');
        aiHelp();
      } catch (err) {
        console.error(chalk.red('❌ Could not load ai-help.js'));
        console.error(chalk.gray(err.message));
        process.exit(1);
      }
    } else if (args['--start']) {
      const config = getConfig();
      start(config);
    } else {
      usage();
    }
  } catch (e) {
    logger.warning(e.message);
    console.log();
    usage();
    process.exit(1);
  }
};

run(); // 🚀 Launch CLI
