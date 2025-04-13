const logger = require('../logger');
const config = require('../../config/config.json');
const language = require(`../../languages/${config.language}.json`);

class EventHandler {
  constructor(api, commandHandler) {
    this.api = api;
    this.commandHandler = commandHandler;
  }

  async handleEvent(event) {

    if (event.type === 'message') {
      const isGroup = event.isGroup ? 'Group' : 'Inbox';
      this.api.getUserInfo(event.senderID, (err, userInfo) => {
        if (err) {
          logger.error(`Failed to get user info: ${err.message}`);
          return;
        }
        const senderName = userInfo[event.senderID]?.name || 'Unknown';
        const logMessage = language.messageLog
          .replace('{context}', isGroup)
          .replace('{sender}', senderName)
          .replace('{body}', event.body || '(no text)');
        logger.info(logMessage);
      });

      if (event.body && event.body.toLowerCase() === 'ping') {
        const response = `${config.bot.botName}: ${language.pingResponse}`;
        this.api.sendMessage(response, event.threadID, (sendErr) => {
          if (sendErr) {
            logger.error(`Failed to send message: ${sendErr.message}`);
          } else {
            logger.info(`Sent: ${response}`);
          }
        });
        return;
      }

      await this.commandHandler.handleCommand(event);
    }
  }
}

module.exports = EventHandler;