const config = require('../../config/config.json');
const logger = require('../../includes/logger');

module.exports = {
  name: "unsend",
  version: "1.0.4",
  author: "Hridoy",
  description: "Deletes a bot message when replied to with this command.",
  adminOnly: false,
  commandCategory: "utility",
  guide: "Reply to a bot message with !unsend to delete it.",
  cooldowns: 5,
  usePrefix: true,

  async execute({ api, event, args }) {
    try {
     
      const botID = api.getCurrentUserID();
      const prefix = config.bot.prefix || "!"; // Use default "!" if prefix is not defined

      
      logger.verbose(`Event Data: ${JSON.stringify(event, null, 2)}`);

      
      if (!event.messageReply || !event.messageReply.messageID) {
        logger.warn("No reply detected or missing messageID in event.messageReply.");
        return api.sendMessage(
          `Please reply to a bot message with ${prefix}unsend to delete it.`,
          event.threadID,
          event.messageID
        );
      }

    
      const repliedMessage = event.messageReply;
      logger.verbose(`Replied Message Data: ${JSON.stringify(repliedMessage, null, 2)}`);

    
      if (repliedMessage.senderID !== botID) {
        logger.info(
          `Replied message senderID (${repliedMessage.senderID}) does not match botID (${botID}).`
        );
        return api.sendMessage(
          `You can only unsend messages sent by ${config.bot.botName || "this bot"}.`,
          event.threadID,
          event.messageID
        );
      }

    
      const messageIDToUnsend = repliedMessage.messageID;
      logger.info(`Attempting to unsend message with ID: ${messageIDToUnsend}`);

      api.unsendMessage(messageIDToUnsend, (err) => {
        if (err) {
          logger.error(`Failed to unsend message: ${err.message}`);
          return api.sendMessage(
            `An error occurred while trying to unsend the message: ${err.message}`,
            event.threadID,
            event.messageID
          );
        }
 
              logger.info("Message unsent successfully.");
        api.sendMessage(
          "The message has been successfully unsent.",
              event.threadID,
          event.messageID
        );
      });
    } catch (err) {
      logger.error(`Unexpected error in unsend command: ${err.message}`);
                api.sendMessage(
                  `An unexpected error occurred: ${err.message}`,
        event.threadID,
           event.messageID
      );
    }
  },
};