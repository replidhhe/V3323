const config = require('../../config/config.json');
const logger = require('../../includes/logger');
const os = require('os');

const startTime = Date.now();

module.exports = {
    name: "uptime",
    version: "1.0.0",
    author: "Hridoy",
    description: "Displays the bot's uptime and server information.",
    adminOnly: false,
    commandCategory: "Utility",
    guide: "Use {pn}uptime to check the bot's uptime and server details.",
    cooldowns: 5,
    usePrefix: true,

    async execute({ api, event, args }) {
        const threadID = event.threadID;
        const messageID = event.messageID;

        try {

            if (!event || !threadID || !messageID) {
                logger.error("Invalid event object in uptime command", { event });
                return api.sendMessage(`${config.bot.botName}: ❌ Invalid event data.`, threadID);
            }

            logger.info(`Received command: .uptime in thread ${threadID}`);

            const uptimeMs = Date.now() - startTime;
            const seconds = Math.floor((uptimeMs / 1000) % 60);
            const minutes = Math.floor((uptimeMs / (1000 * 60)) % 60);
            const hours = Math.floor((uptimeMs / (1000 * 60 * 60)) % 24);
            const days = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));

            const totalMemory = (os.totalmem() / (1024 ** 3)).toFixed(2); 
            const freeMemory = (os.freemem() / (1024 ** 3)).toFixed(2); 
            const usedMemory = (totalMemory - freeMemory).toFixed(2); 
            const cpuModel = os.cpus()[0].model;
            const cpuCores = os.cpus().length;
            const platform = os.platform();
            const hostname = os.hostname();

    
            const uptimeStr = `${days}d ${hours}h ${minutes}m ${seconds}s`;

            const msgBody = `┌──────────────────┐\n` +
                           `│ ${config.bot.botName}: Bot Status │\n` +
                           `└──────────────────┘\n\n` +
                           `⏰ Uptime: ${uptimeStr}\n\n` +
                           `┌─ 🖥️ Server Info ─┐\n` +
                           `│ Hostname: ${hostname}\n` +
                           `│ Platform: ${platform}\n` +
                           `│ CPU: ${cpuModel}\n` +
                           `│ Cores: ${cpuCores}\n` +
                           `│ Memory: ${usedMemory}GB / ${totalMemory}GB\n` +
                           `│ Free: ${freeMemory}GB\n` +
                           `└──────────────────┘`;

        
            logger.info("Sending uptime and server info");
            await api.sendMessage(msgBody, threadID, messageID);
            logger.info("Uptime info sent successfully");

        } catch (err) {
            logger.error(`Error in uptime command: ${err.message}`, { stack: err.stack });
            await api.sendMessage(
                `${config.bot.botName}: ⚠️ Error: ${err.message}`,
                threadID,
                messageID
            );
        }
    }
};