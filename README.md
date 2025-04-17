
# NexaSim V2 - Bot Chat Messenger

  

![NexaSim V2 Banner](https://raw.githubusercontent.com/1dev-hridoy/NexaSim-v2/main/assets/banner.png)

  

A fun and engaging messenger bot for SimSim talk and entertainment, built with Node.js.

  

![Node.js](https://img.shields.io/badge/Node.js-Supported-brightgreen) ![Size](https://img.shields.io/badge/Size-14.3_MB-blue) ![Code Version](https://img.shields.io/badge/Code_Version-1.5.35-yellow) ![Visitors](https://img.shields.io/badge/Visitors-391-orange) ![License](https://img.shields.io/badge/License-MIT-green)

  

---

  

## Table of Contents

  

-  [What is NexaSim V2?](#what-is-nexasim-v2)

-  [How It Works](#how-it-works)

- [Database Setup](#database-setup)

-  [Creating Commands](#creating-commands)

-  [Simple Command](#simple-command)

-  [Admin Command](#admin-command)

-  [Economy Command](#economy-command)

-  [Screenshots](#screenshots)

-  [Support](#support)

-  [Additional Information](#additional-information)

-  [Copyright and License](#copyright-and-license)

  

---

  

## What is NexaSim V2?

  

NexaSim V2 is a messenger bot designed for fun and SimSim talk, allowing users to engage in entertaining conversations and perform various tasks like downloading videos, generating images, and interacting with AI. I created this bot to bring joy and utility to messenger group chats, making conversations more interactive and enjoyable for everyone.

  

---

  

## How It Works

  

NexaSim V2 is built using Node.js and integrates with the Facebook Messenger API. It listens for messages, processes commands, and responds accordingly. Here's a simple overview of how it works:

  

1.  **User sends a message** with a command prefix (e.g., `.help`).

2.  **Bot processes the command** by matching it with registered commands.

3.  **Bot executes the command logic** (e.g., API calls, file downloads, or text responses).

4.  **Bot sends a response** back to the user with the result.

  

### Example: Basic Command Execution

```javascript

// Example command: .hello

module.exports = {

name: "hello",

description: "Says hello to the user",

async  execute({ api, event }) {

api.sendMessage("Hello! How can I help you today?", event.threadID);

}

};

```

  

## Database Setup

To set up the database for NexaSim V2, follow these steps:

1. Navigate to the `includes/database/` directory in the repository.
2. Locate the file `example.index.js` and rename it to `index.js`.
3. Open `index.js` and find the MongoDB URI placeholder.
4. Replace the placeholder with your actual MongoDB URI (e.g., `mongodb://your-username:your-password@your-host:27017/your-database`).
5. Save the file.

Your bot will now connect to your MongoDB database for storing user data, economy balances, or other features requiring persistence.

  

## Creating Commands

  

NexaSim V2 allows you to create various types of commands. Below are examples of a simple command, an admin command, and an economy command.

  

### Simple Command

A basic command that anyone can use.

  

```javascript

const  config  =  require('../../config/config.json');
module.exports = {

name: "uid",
version: "1.0.0",
author: "Hridoy",
description: "Shows the UID of the user, a mentioned user, or the replied-to user.",
adminOnly: false,
commandCategory: "utility",
guide: "Use {pn}uid to get your UID, {pn}uid @username to get a mentioned user's UID, or reply to a message with {pn}uid to get that user's UID.",
cooldowns: 5,
usePrefix: true,

async  execute({ api, event, args }) {
if (!event  ||  !event.threadID  ||  !event.messageID) {
console.error("Invalid event object in uid command");
return  api.sendMessage(`${config.bot.botName}: ❌ Invalid event data.`, event.threadID);
}

let  targetUid;
let  targetName  =  "User"; 
try {
if (event.type  ===  "message_reply"  &&  event.messageReply) {
targetUid  =  event.messageReply.senderID;
const  userInfo  =  await  new  Promise((resolve) => {
api.getUserInfo(targetUid, (err, info) =>  resolve(err  ? {} :  info));
});
targetName  =  userInfo[targetUid]?.name  ||  "Replied User";
}
else  if (event.mentions  &&  Object.keys(event.mentions).length  >  0) {
const  mentionedUsers  =  Object.keys(event.mentions);
if (mentionedUsers.length  >  1) {
return  api.sendMessage(`${config.bot.botName}: Please mention only one user.`, event.threadID, event.messageID);
}
targetUid  =  mentionedUsers[0];
targetName  =  event.mentions[targetUid] ||  "Mentioned User";
}
else {
targetUid  =  event.senderID;
const  userInfo  =  await  new  Promise((resolve) => {
api.getUserInfo(targetUid, (err, info) =>  resolve(err  ? {} :  info));
});
targetName  =  userInfo[targetUid]?.name  ||  "You";
}
await  api.sendMessage(
`${config.bot.botName}: ${targetName}'s UID: ${targetUid}`,
event.threadID,
event.messageID
);
} catch (error) {
console.error("❌ Error in uid command:", error);
await  api.sendMessage(

`${config.bot.botName}: ❌ Failed to retrieve UID.`,

event.threadID,

event.messageID

);
}
}
};
```


### Admin Command

A command restricted to admins, useful for moderation.

  

```javascript

const  config  =  require('../../config/config.json');
module.exports = {
name: "uid",
version: "1.0.0",
author: "Hridoy",
description: "Shows the UID of the user, a mentioned user, or the replied-to user.",
adminOnly: true,
commandCategory: "utility",
guide: "Use {pn}uid to get your UID, {pn}uid @username to get a mentioned user's UID, or reply to a message with {pn}uid to get that user's UID.",
cooldowns: 5,
usePrefix: true,

async  execute({ api, event, args }) {

....

```

  

### Economy Command

A command for managing a virtual economy, like a balance system.

  

```javascript

const  config  =  require('../../config/config.json');
const { connect } =  require('../../includes/database');
const  logger  =  require('../../includes/logger');
module.exports = {

name: "work",
version: "1.0.0",
author: "Hridoy",
description: "Earn a random amount of currency (15/20/25) once every 24 hours.",
adminOnly: false,
commandCategory: "economy",
guide: "Use {pn}work to earn currency once every 24 hours.",
cooldowns: 0,
usePrefix: true,

async  execute({ api, event, args }) {
if (!event  ||  !event.threadID  ||  !event.messageID) {
console.error("Invalid event object in work command");
return  api.sendMessage(`${config.bot.botName}: ❌ Invalid event data.`, event.threadID);
}
const  db  =  await  connect();
const  usersCollection  =  db.collection('users');

const  user  =  await  usersCollection.findOne({ userId: event.senderID });
if (!user) {
return  api.sendMessage(`${config.bot.botName}: ⚠️ User not found in database.`, event.threadID);
}
const  now  =  Date.now();
const  lastWork  =  user.lastWork  ||  0;
const  cooldown  =  24  *  60  *  60  *  1000;

if (now  -  lastWork  <  cooldown) {
const  timeLeft  =  Math.ceil((cooldown  - (now  -  lastWork)) / (60  *  60  *  1000));
return  api.sendMessage(`${config.bot.botName}: ⚠️ You can only work once every 24 hours. Try again in ${timeLeft} hours.`, event.threadID);

}
const  amounts  = [15, 20, 25];
const  earnedAmount  =  amounts[Math.floor(Math.random() *  amounts.length)];
const  newBalance  = (user.balance  ||  0) +  earnedAmount;
await  usersCollection.updateOne(
{ userId: event.senderID },
{ $set: { balance: newBalance, lastWork: now } }
);
logger.info(`User ${event.senderID} worked and earned ${earnedAmount}. New balance: ${newBalance}`);
api.sendMessage(`${config.bot.botName}: ✅ You worked and earned ${earnedAmount}! Your new balance is ${newBalance}.`, event.threadID);
}
};

```

  

---

  

## Screenshots

  

Here are some screenshots of NexaSim V2 in action:

  

![Command Usage](https://raw.githubusercontent.com/1dev-hridoy/NexaSim-v2/main/assets/screenshot1.png)

*Using the `.help` command to list available commands.*

  

![SimSim And Game](https://raw.githubusercontent.com/1dev-hridoy/NexaSim-v2/main/assets/screenshot2.png)

*Chat with NexaSim `.bot`.*  *Also you can play a game `.hangman`*.

  

![Advance Api And Canvas](https://raw.githubusercontent.com/1dev-hridoy/NexaSim-v2/main/assets/screenshot3.png)

*A advance example canvas and api command `.gitcard` command.*

  

---

  

## Support

  

For support or to connect with the community, reach out via:

  

-  **Telegram**: [Join our Telegram](https://t.me/nexalo_simsim)

-  **Facebook**: [My facebook](https://www.facebook.com/hridoy.py/)

-  **Instagram**: [My instagram](https://instagram.com/hridoy.py)

-  **GitHub**: [Visit the Repository](https://github.com/1dev-hridoy/NexaSim-v2)

  

---

  

## Additional Information

  

-  **Codebase**: Written in Node.js, leveraging the `axios` library for API requests and `fs` for file handling.

-  **Features**: Includes video downloading (YouTube, Instagram, Facebook), AI interactions (GPT-4), image generation, and more.

-  **Performance**: Optimized for low-latency responses, with a modular command structure for easy expansion.

-  **Dependencies**: Requires Node.js v20 and dependencies listed in `package.json`.

  

---

  

## Copyright and License

  

© 2025 Hridoy (1dev-hridoy). All rights reserved.

  

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

  

---