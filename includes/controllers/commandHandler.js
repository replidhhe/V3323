const fs = require('fs');
const path = require('path');
const logger = require('../logger');
const config = require('../../config/config.json');
const language = require(`../../languages/${config.language}.json`);

class CommandHandler {
  constructor(api) {
    this.api = api;
    this.commands = new Map();
    this.cooldowns = new Map();
    this.loadCommands();
  }

  loadCommands() {
    const commandDir = path.join(__dirname, '../../modules/commands');
    const files = fs.readdirSync(commandDir).filter(file => file.endsWith('.js'));

    for (const file of files) {
      const command = require(path.join(commandDir, file));
      this.commands.set(command.name, command);
      logger.info(`Loaded command: ${command.name}`);
    }
  }

  async handleCommand(event) {
    if (event.type !== 'message' || !event.body) return;

    const prefix = config.bot.prefix;
    const usePrefix = event.body.startsWith(prefix);
    const args = event.body.split(' ').slice(1);
    const commandName = usePrefix ? event.body.slice(prefix.length).split(' ')[0].toLowerCase() : event.body.toLowerCase();

    const command = this.commands.get(commandName);
    if (!command) return;

    if (command.usePrefix && !usePrefix) return;

    if (command.adminOnly) {
      const adminUids = config.bot.adminUids;
      if (!adminUids.includes(event.senderID)) {
        this.api.sendMessage('This command is for admins only.', event.threadID);
        return;
      }
    }

    const cooldownKey = `${event.senderID}-${command.name}`;
    const now = Date.now();
    const cooldownTime = (command.cooldowns || 0) * 1000;

    if (this.cooldowns.has(cooldownKey)) {
      const expiration = this.cooldowns.get(cooldownKey);
      if (now < expiration) {
        const secondsLeft = Math.ceil((expiration - now) / 1000);
        this.api.sendMessage(
          language.cooldownError.replace('{seconds}', secondsLeft),
          event.threadID
        );
        return;
      }
    }

    try {
      await command.execute({ api: this.api, event, args });
      this.cooldowns.set(cooldownKey, now + cooldownTime);
    } catch (err) {
      logger.error(`Command ${command.name} failed: ${err.message}`);
      this.api.sendMessage('An error occurred while executing the command.', event.threadID);
    }
  }
}

module.exports = CommandHandler;