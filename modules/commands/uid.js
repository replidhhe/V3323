const config = require('../../config/config.json');

module.exports = {
    name: "uid",
    version: "1.0.0",
    author: "Hridoy",
    description: "Shows the UID of the user or the replied-to user.",
    adminOnly: false,
    commandCategory: "utility",
    guide: "Use {pn}uid to get your UID, or reply to a message with {pn}uid to get that user's UID.",
    cooldowns: 5,
    usePrefix: true,

    async execute({ api, event, args }) {
        if (!event || !event.threadID || !event.messageID) {
            console.error("Invalid event object in uid command");
            return api.sendMessage(`${config.bot.botName}: ❌ Invalid event data.`, event.threadID);
        }

        let targetUid;
        if (event.type === "message_reply" && event.messageReply) {
            targetUid = event.messageReply.senderID;
        } else {
            targetUid = event.senderID;
        }

        try {
            api.sendMessage(`${config.bot.botName}: UID: ${targetUid}`, event.threadID);
        } catch (error) {
            console.error("❌ Error sending UID:", error);
            api.sendMessage(`${config.bot.botName}: ❌ Failed to send UID.`, event.threadID, event.messageID);
        }
    }
};