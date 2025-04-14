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
    if (!event || (event.type !== 'message' && event.type !== 'message_reply') || !event.body) {
      logger.error('Invalid event object in handleCommand');
      return;
    }

    const prefix = config.bot.prefix;
    const bodyLower = event.body.toLowerCase();
    let commandName;
    let args;

    if (bodyLower.startsWith(prefix)) {
      const parts = event.body.slice(prefix.length).trim().split(' ');
      commandName = parts[0].toLowerCase();
      args = parts.slice(1);
    } else {
      const parts = event.body.trim().split(' ');
      commandName = parts[0].toLowerCase();
      args = parts.slice(1);
    }

    const command = this.commands.get(commandName);
    if (!command) return;

    if (command.usePrefix && !event.body.startsWith(prefix)) return;

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