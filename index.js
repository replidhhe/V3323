const logger = require('./includes/logger');
const { authenticate } = require('./utils/auth');
const CommandHandler = require('./includes/controllers/commandHandler');
const EventHandler = require('./includes/handle/eventHandler');
const MessageEvent = require('./modules/events/message');
const OwnerNotification = require('./modules/events/ownerNotification'); 
const gradient = require('gradient-string');
const chalk = require('chalk');
const config = require('./config/config.json');

const banner = `
███╗░░██╗███████╗██╗░░██╗░█████╗░██╗███╗░░░███╗  ██╗░░░██╗██████╗░
████╗░██║██╔════╝╚██╗██╔╝██╔══██╗██║████╗░████║  ██║░░░██║╚════██╗
██╔██╗██║█████╗░░░╚███╔╝░███████║██║██╔████╔██║  ╚██╗░██╔╝░░███╔═╝
██║╚████║██╔══╝░░░██╔██╗░██╔══██║██║██║╚██╔╝██║  ░╚████╔╝░██╔══╝░░
██║░╚███║███████╗██╔╝╚██╗██║░░██║██║██║░╚═╝░██║  ░░╚██╔╝░░███████╗
╚═╝░░╚══╝╚══════╝╚═╝░░╚═╝╚═╝░░╚═╝╚═╝╚═╝░░░░░╚═╝  ░░░╚═╝░░░╚══════╝
`;

function displayBanner() {
  const bannerGradient = gradient(['#ff69b4', '#00ffff']);
  console.log(bannerGradient(banner));

  const subText = 'NexaSim v2.0 | A Professional FB Messenger Bot';
  console.log(bannerGradient(subText));
  console.log(bannerGradient('Created by: 1dev-hridoy'));
  console.log(chalk.gray('---------------------------------------------'));
  logger.info('STARTUP: Initializing bot...');
  logger.info(`BOT NAME: ${config.bot.botName}`);
  logger.info(`BOT ID: ${config.bot.ownerUid}`);
  logger.info(`PREFIX: ${config.bot.prefix}`);
  logger.info(`LANGUAGE: ${config.language}`);
}

async function startBot() {
  try {
    displayBanner();

    const api = await authenticate();
    api.setOptions({
      listenEvents: true,
      selfListen: false,
      forceLogin: true
    });

    const commandHandler = new CommandHandler(api);
    const eventHandler = new EventHandler(api, commandHandler);
    const messageEvent = new MessageEvent(api, eventHandler);
    const ownerNotification = new OwnerNotification(api); // Initialize owner notification

    messageEvent.start(true);
    ownerNotification.start(); // Start owner notifications
  } catch (err) {
    logger.error('Bot startup failed');
    process.exit(1);
  }
}

startBot();