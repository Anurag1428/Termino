import chalk from 'chalk';
import inquirer from 'inquirer';
import { exec } from 'child_process';
import { promisify } from 'util';
import { createLogger } from '../logger.js';
import { AIService } from '../services/ai-service.js';

const execAsync = promisify(exec);
const logger = createLogger('terminal');

let aiService = null;

function initAI(config) {
  if (config.kimiApiKey) {
    aiService = new AIService(config.kimiApiKey);
    return true;
  }
  return false;
}

async function showMainMenu() {
  const choices = [
    { name: '🖥️  Execute Terminal Command', value: 'execute' },
    { name: '🤖  Ask AI to Explain a Command', value: 'explain' },
    { name: '💡  Ask AI to Suggest a Command', value: 'suggest' },
    { name: '📚  Learn Basic Commands', value: 'learn' },
    { name: '🚪  Exit', value: 'exit' }
  ];

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices
    }
  ]);

  return action;
}

async function executeCommand() {
  const { command } = await inquirer.prompt([
    {
      type: 'input',
      name: 'command',
      message: 'Enter your command:',
      validate: (input) => input.trim() !== '' || 'Please enter a command'
    }
  ]);

  // Safety check for dangerous commands
  const dangerousCommands = ['rm -rf', 'format', 'del /f', 'sudo rm'];
  const isDangerous = dangerousCommands.some(danger => 
    command.toLowerCase().includes(danger.toLowerCase())
  );

  if (isDangerous) {
    console.log(chalk.red('⚠️  WARNING: This command might be dangerous!'));
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Are you sure you want to run this command?',
        default: false
      }
    ]);

    if (!confirm) {
      console.log(chalk.yellow('Command cancelled for safety.'));
      return;
    }
  }

  try {
    console.log(chalk.blue('Executing...'));
    const { stdout, stderr } = await execAsync(command);
    
    if (stdout) {
      console.log(chalk.green('Output:'));
      console.log(stdout);
    }
    
    if (stderr) {
      console.log(chalk.yellow('Warnings/Errors:'));
      console.log(stderr);
      
      // Ask AI to explain error if available
      if (aiService) {
        const { explainError } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'explainError',
            message: 'Would you like AI to explain this error?',
            default: true
          }
        ]);
        
        if (explainError) {
          console.log(chalk.cyan('🤖 AI Explanation:'));
          const explanation = await aiService.explainError(command, stderr);
          console.log(chalk.cyan(explanation));
        }
      }
    }
    
  } catch (error) {
    console.log(chalk.red('Error executing command:'));
    console.log(error.message);
    
    if (aiService) {
      console.log(chalk.cyan('🤖 AI Help:'));
      const explanation = await aiService.explainError(command, error.message);
      console.log(chalk.cyan(explanation));
    }
  }
}

async function explainCommand() {
  if (!aiService) {
    console.log(chalk.red('AI service not available. Please configure your Kimi API key.'));
    return;
  }

  const { command } = await inquirer.prompt([
    {
      type: 'input',
      name: 'command',
      message: 'Which command would you like me to explain?',
      validate: (input) => input.trim() !== '' || 'Please enter a command'
    }
  ]);

  console.log(chalk.cyan('🤖 Thinking...'));
  const explanation = await aiService.explainCommand(command);
  console.log(chalk.cyan('AI Explanation:'));
  console.log(chalk.white(explanation));
}

async function suggestCommand() {
  if (!aiService) {
    console.log(chalk.red('AI service not available. Please configure your Kimi API key.'));
    return;
  }

  const { task } = await inquirer.prompt([
    {
      type: 'input',
      name: 'task',
      message: 'What do you want to do? (e.g., "find all .txt files", "check disk space")',
      validate: (input) => input.trim() !== '' || 'Please describe what you want to do'
    }
  ]);

  console.log(chalk.cyan('🤖 Finding the best command for you...'));
  const suggestion = await aiService.suggestCommand(task);
  console.log(chalk.cyan('AI Suggestion:'));
  console.log(chalk.white(suggestion));
}

function showBasicCommands() {
  console.log(chalk.green.bold('\n📚 Essential Terminal Commands for Beginners:\n'));
  
  const commands = [
    { cmd: 'ls', desc: 'List files and folders in current directory' },
    { cmd: 'cd [folder]', desc: 'Change to a different folder' },
    { cmd: 'pwd', desc: 'Show current folder path' },
    { cmd: 'mkdir [name]', desc: 'Create a new folder' },
    { cmd: 'touch [file]', desc: 'Create a new empty file' },
    { cmd: 'cp [from] [to]', desc: 'Copy a file' },
    { cmd: 'mv [from] [to]', desc: 'Move or rename a file' },
    { cmd: 'rm [file]', desc: 'Delete a file (be careful!)' },
    { cmd: 'cat [file]', desc: 'Show contents of a file' },
    { cmd: 'clear', desc: 'Clear the terminal screen' }
  ];

  commands.forEach(({ cmd, desc }) => {
    console.log(`${chalk.cyanBright(cmd.padEnd(20))} ${chalk.white(desc)}`);
  });
  
  console.log(chalk.yellow('\n💡 Tip: You can ask AI to explain any of these commands in detail!\n'));
}

export async function terminal(config) {
  logger.highlight('🚀 Starting AI Terminal Helper');
  
  const hasAI = initAI(config);
  if (!hasAI) {
    console.log(chalk.yellow('⚠️  AI features disabled. Add your Kimi API key to config for full functionality.'));
  } else {
    console.log(chalk.green('✅ AI assistant ready!'));
  }

  console.log(chalk.blue('\nWelcome to your AI-enhanced terminal! I\'m here to help you learn.\n'));

  while (true) {
    try {
      const action = await showMainMenu();
      
      switch (action) {
        case 'execute':
          await executeCommand();
          break;
        case 'explain':
          await explainCommand();
          break;
        case 'suggest':
          await suggestCommand();
          break;
        case 'learn':
          showBasicCommands();
          break;
        case 'exit':
          console.log(chalk.green('👋 Happy coding! Come back anytime to learn more.'));
          process.exit(0);
          break;
      }
      
      // Wait for user to continue
      await inquirer.prompt([
        {
          type: 'input',
          name: 'continue',
          message: 'Press Enter to continue...'
        }
      ]);
      
    } catch (error) {
      if (error.name === 'ExitPromptError') {
        console.log(chalk.green('\n👋 Goodbye!'));
        process.exit(0);
      } else {
        logger.warning('Error in terminal:', error.message);
      }
    }
  }
}