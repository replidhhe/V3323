const logger = require('../../includes/logger');
const config = require('../../config/config.json');

class OwnerNotification {
  constructor(api) {
    this.api = api;
    this.ownerUid = config.bot.ownerUid;
    this.botName = config.bot.botName;
  }

  start() {

    const onlineMessage = `${this.botName}: Bot is online`;
    this.api.sendMessage(onlineMessage, this.ownerUid, (err) => {
      if (err) {
        logger.error(`Failed to send online message to owner: ${err.message}`);
      } else {
        logger.info(`Sent to owner: ${onlineMessage}`);
      }
    });

    setInterval(() => {
      const hiMessage = `${this.botName}: Hi`;
      this.api.sendMessage(hiMessage, this.ownerUid, (err) => {
        if (err) {
          logger.error(`Failed to send hi message to owner: ${err.message}`);
        } else {
          logger.info(`Sent to owner: ${hiMessage}`);
        }
      });
    }, 60 * 1000);
  }
}

module.exports = OwnerNotification;