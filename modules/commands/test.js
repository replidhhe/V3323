module.exports = {
    name: "test",
    version: "1.0.1",
    author: "Hridoy",
    description: "A test command for update system - updated for 1.0.3",
    adminOnly: false,
    commandCategory: "Utility",
    guide: "Type {pn}test to run this command.",
    cooldowns: 5,
    usePrefix: true,

    async execute({ api, event }) {
        const threadID = event.threadID;
        api.sendMessage("This is an updated test command for version 1.0.3!", threadID);
    }
};
