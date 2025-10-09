const chalk = require('chalk');
const dayjs = require('dayjs');

// Light timestamp function
const timestamp = () => chalk.gray(`[${dayjs().format('HH:mm:ss')}]`);

const logger = {
  info: (msg) => {
    console.log(`${timestamp()} ${chalk.cyan('ℹ')} ${chalk.blue(msg)}`);
  },

  success: (msg) => {
    console.log(`${timestamp()} ${chalk.green('✓')} ${chalk.green(msg)}`);
  },

  warn: (msg) => {
    console.warn(`${timestamp()} ${chalk.yellow('⚠')} ${chalk.yellow(msg)}`);
  },

  error: (msg) => {
    console.error(`${timestamp()} ${chalk.red('✗')} ${chalk.red(msg)}`);
  },

  debug: (msg) => {
    console.debug(`${timestamp()} ${chalk.magenta('◦')} ${chalk.magenta(msg)}`);
  }
};

module.exports = logger;
