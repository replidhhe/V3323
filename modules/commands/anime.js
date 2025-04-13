const config = require('../../config/config.json');

module.exports = {
  name: "anime",
  version: "1.0.2",
  author: "Hridoy",
  description: "Fetches a random anime image or info.",
  adminOnly: false,
  commandCategory: "random-img",
  guide: "Use !anime to get a random anime image.",
  cooldowns: 5,
  usePrefix: true,

  async execute({ api, event, args }) {
    const message = `${config.bot.botName}: Here’s a random anime image! (Placeholder)`;
    api.sendMessage(message, event.threadID);
  }
};