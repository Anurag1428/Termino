import chalk from 'chalk';
import inquirer from 'inquirer';
import { AIService } from '../services/ai-service.js';
import { getConfig } from '../config/config-mgr.js';

export async function aiHelp() {
  console.log(chalk.cyan.bold('🤖 AI Command Helper\n'));
  
  const config = getConfig();
  
  if (!config.kimiApiKey) {
    console.log(chalk.red('❌ No AI API key configured.'));
    console.log(chalk.yellow('Add your Kimi K2 API key to your config file to use AI features.'));
    console.log(chalk.blue('Example: Add "kimiApiKey": "your-key-here" to tool.config.js'));
    return;
  }

  const aiService = new AIService(config.kimiApiKey);

  const { helpType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'helpType',
      message: 'What kind of help do you need?',
      choices: [
        { name: '💭 Explain a command', value: 'explain' },
        { name: '🔍 Suggest a command for a task', value: 'suggest' },
        { name: '🆘 Help with an error', value: 'error' }
      ]
    }
  ]);

  try {
    switch (helpType) {
      case 'explain':
        const { command } = await inquirer.prompt([
          {
            type: 'input',
            name: 'command',
            message: 'Enter the command you want explained:',
            validate: (input) => input.trim() !== '' || 'Please enter a command'
          }
        ]);
        
        console.log(chalk.cyan('🤖 Analyzing command...'));
        const explanation = await aiService.explainCommand(command);
        console.log(chalk.green('\n✨ AI Explanation:'));
        console.log(chalk.white(explanation));
        break;

      case 'suggest':
        const { task } = await inquirer.prompt([
          {
            type: 'input',
            name: 'task',
            message: 'Describe what you want to do:',
            validate: (input) => input.trim() !== '' || 'Please describe your task'
          }
        ]);
        
        console.log(chalk.cyan('🤖 Finding the perfect command...'));
        const suggestion = await aiService.suggestCommand(task);
        console.log(chalk.green('\n💡 AI Suggestion:'));
        console.log(chalk.white(suggestion));
        break;

      case 'error':
        const errorQuestions = await inquirer.prompt([
          {
            type: 'input',
            name: 'command',
            message: 'What command did you run?',
            validate: (input) => input.trim() !== '' || 'Please enter the command'
          },
          {
            type: 'input',
            name: 'error',
            message: 'What error message did you get?',
            validate: (input) => input.trim() !== '' || 'Please enter the error message'
          }
        ]);
        
        console.log(chalk.cyan('🤖 Analyzing error...'));
        const errorHelp = await aiService.explainError(errorQuestions.command, errorQuestions.error);
        console.log(chalk.green('\n🔧 AI Error Help:'));
        console.log(chalk.white(errorHelp));
        break;
    }
  } catch (error) {
    console.log(chalk.red('Sorry, I encountered an error while helping you.'));
    console.log(chalk.yellow('Please try again later.'));
  }
}