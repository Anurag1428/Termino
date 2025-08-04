#!/usr/bin/env node
const arg = require('arg');
const chalk = require('chalk');

function usage () {
  console.log(`
tool [CMD]
  --start\t\tStarts the app
  --build\t\tBuilds the app
`);
}

try {
  const args = arg({
    '--start': Boolean,
    '--build': Boolean
  });

  if (args['--start']) console.log(chalk.bgCyanBright('starting the app!'));
  else if (args['--build']) console.log('building the app!');
  else usage();

} catch (err) {
  console.error(chalk.yellow(err.message));
  console.log();
  usage();
  process.exit(1);
}