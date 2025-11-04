import { DiscordBot } from './bot';
import { Logger } from './utils/logger';

async function main() {
  try {
    Logger.info('Starting VRChat Account Generator Bot...');
    
    const bot = new DiscordBot();
    await bot.start();
    
    Logger.success('Bot started successfully!');
  } catch (error) {
    Logger.error('Failed to start bot:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  Logger.info('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  Logger.info('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  Logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  Logger.error('Uncaught Exception:', error);
  process.exit(1);
});

main();