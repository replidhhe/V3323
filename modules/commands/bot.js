/******************************************************************************
 * WARNING: Use your own API to send your bot's name in "Who are you?" kind   *
 * of questions. This feature is expected to be available in a future API    *
 * update. Ensure to implement this custom behavior for now.                 *
 ******************************************************************************/

const config = require('../../config/config.json');
const logger = require('../../includes/logger');
const axios = require('axios');

// ====== CONFIG ZONE ======
const SIM_API_URL = 'https://sim.api.nexalo.xyz/v1/chat';
const API_KEY = 'MAINPOINT';
const LANGUAGE = 'bn';
const DEFAULT_QUESTION = 'ki koro';
// ==========================

module.exports = {
    name: "bot",
    version: "1.0.5",
    author: "Hridoy",
    description: "Chat with the Nexalo SIM API to get answers to your questions.",
    adminOnly: false,
    commandCategory: "AI",
    guide: "Use {pn}bot <question> to ask a question.\n" +
           "Example: {pn}bot What is the weather like?",
    cooldowns: 5,
    usePrefix: true,

    async execute({ api, event, args }) {
        const threadID = event.threadID;
        const messageID = event.messageID;

        try {
            // Validate event object
            if (!event || !threadID || !messageID) {
                logger.error("Invalid event object in bot command", { event });
                return api.sendMessage(`${config.bot.botName}: ❌ Invalid event data.`, threadID);
            }

            const question = args.join(" ").trim() || DEFAULT_QUESTION;
            logger.info(`Received command: .bot ${question} in thread ${threadID}`);

            // Prepare API payload
            const payload = {
                api: API_KEY,
                question: question,
                language: LANGUAGE
            };

            logger.info(`Sending request to Nexalo SIM API: ${JSON.stringify(payload)}`);

            // Send request to Nexalo SIM API
            const res = await axios.post(SIM_API_URL, payload, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000 // 30-second timeout
            });

            logger.info(`API response received: ${JSON.stringify(res.data)}`);

            // Handle API response
            if (res.data.status_code === 200 && res.data.status === 'OK' && res.data.data && res.data.data.answer) {
                const answer = res.data.data.answer;
                logger.info(`Sending answer: ${answer}`);
                await new Promise((resolve, reject) => {
                    api.sendMessage(
                        `${config.bot.botName}: ${answer}`,
                        threadID,
                        (err) => {
                            if (err) {
                                logger.error(`Failed to send answer: ${err.message}`);
                                reject(err);
                            } else {
                                logger.info("Answer sent successfully");
                                resolve();
                            }
                        }
                    );
                });
            } else {
                const errorMessage = res.data.message || 'No answer returned.';
                logger.warn(`API returned an error: ${errorMessage}`);
                await new Promise((resolve, reject) => {
                    api.sendMessage(
                        `${config.bot.botName}: API Error: ${errorMessage}`,
                        threadID,
                        (err) => {
                            if (err) {
                                logger.error(`Failed to send API error message: ${err.message}`);
                                reject(err);
                            } else {
                                logger.info("API error message sent successfully");
                                resolve();
                            }
                        }
                    );
                });
            }
        } catch (err) {
            const errorDetails = {
                message: err.message,
                response: err.response ? JSON.stringify(err.response.data) : 'No response',
                status: err.response ? err.response.status : 'N/A'
            };
            logger.error(`Request failed: ${JSON.stringify(errorDetails)}`);
            await new Promise((resolve, reject) => {
                api.sendMessage(
                    `${config.bot.botName}: Sorry, I couldn't reach the API. Please try again later.`,
                    threadID,
                    (err) => {
                        if (err) {
                            logger.error(`Failed to send error message: ${err.message}`);
                            reject(err);
                        } else {
                            logger.info("Error message sent successfully");
                            resolve();
                        }
                    }
                );
            });
        }
    }
};