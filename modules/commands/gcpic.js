const config = require('../../config/config.json');
const logger = require('../../includes/logger');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { createCanvas, loadImage } = require('canvas');

// ====== CONFIG ZONE ======
const ACCESS_TOKEN = '6628568379|c1e620fa708a1d5696fb991c1bde5662';
// ==========================

module.exports = {
    name: "gcpic",
    version: "3.0.0",
    author: "Hridoy",
    description: "Generate a YouTube thumbnail-style canvas with all group members' profile pictures, group name, total members, and admin count 🖼️",
    adminOnly: false,
    commandCategory: "Fun",
    guide: "Use {pn}gcpic to generate a stylish group canvas image with all members' profile pictures, group name, total members, and admin count.",
    cooldowns: 5,
    usePrefix: true,

    async execute({ api, event }) {
        const threadID = event.threadID;
        const messageID = event.messageID;
        const senderID = event.senderID;

        let filePath;

        try {
            if (!event || !threadID || !messageID) {
                logger.error("Invalid event object in gcpic command", { event });
                return api.sendMessage(`${config.bot.botName}: ❌ Invalid event data.`, threadID);
            }

            logger.info(`Received command: .gcpic in thread ${threadID}`);

            const threadInfo = await new Promise((resolve, reject) => {
                api.getThreadInfo(threadID, (err, info) => {
                    if (err) reject(err);
                    else resolve(info);
                });
            });

            if (!threadInfo) {
                throw new Error("Failed to fetch group information");
            }

            const groupName = threadInfo.threadName || "Unknown Group";
            const memberIDs = threadInfo.participantIDs || [];
            const adminIDs = threadInfo.adminIDs ? threadInfo.adminIDs.map(admin => admin.id) : [];
            const totalMembers = memberIDs.length;
            const adminCount = adminIDs.length;

            if (totalMembers === 0) {
                throw new Error("No members found in the group");
            }

            logger.info(`Group: ${groupName}, Total Members: ${totalMembers}, Admins: ${adminCount}`);

            const profilePics = [];
            for (const userID of memberIDs) {
                const profilePicUrl = `https://graph.facebook.com/${userID}/picture?width=512&height=512&access_token=${ACCESS_TOKEN}`;
                try {
                    const imageResponse = await axios.get(profilePicUrl, { responseType: 'arraybuffer' });
                    const image = await loadImage(Buffer.from(imageResponse.data));
                    profilePics.push({ userID, image, isAdmin: adminIDs.includes(userID) });
                } catch (err) {
                    logger.warn(`Failed to fetch profile picture for user ${userID}: ${err.message}`);
                    const placeholderImage = await loadImage('https://i.ibb.co.com/2f8gyzp/836.jpg');
                    profilePics.push({ userID, image: placeholderImage, isAdmin: adminIDs.includes(userID) });
                }
            }

            const canvasWidth = 1280;
            const canvasHeight = 720;
            const canvas = createCanvas(canvasWidth, canvasHeight);
            const ctx = canvas.getContext('2d');

            const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
            gradient.addColorStop(0, '#2e0854');
            gradient.addColorStop(0.4, '#5b0060');
            gradient.addColorStop(0.7, '#d4267d');
            gradient.addColorStop(1, '#e91e63');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);

            const calculateLayout = (count) => {
                if (count <= 4) return { cols: 2, rows: 2 };
                if (count <= 9) return { cols: 3, rows: 3 };
                if (count <= 16) return { cols: 4, rows: 4 };
                const cols = Math.min(Math.ceil(Math.sqrt(count)), 6);
                const rows = Math.ceil(count / cols);
                return { cols, rows };
            };
            
            const { cols, rows } = calculateLayout(totalMembers);
            
            let imageSize = Math.min(
                Math.floor((canvasWidth * 0.8) / cols) - 20,
                Math.floor((canvasHeight * 0.6) / rows) - 20
            );
            imageSize = Math.min(Math.max(imageSize, 80), 150);
            
            const padding = Math.max(imageSize * 0.15, 15);
            
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 15;
            ctx.font = 'bold 60px Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(groupName, canvasWidth / 2, 80);
            
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.moveTo(canvasWidth * 0.2, 100);
            ctx.lineTo(canvasWidth * 0.8, 100);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 3;
            ctx.stroke();

            const gridWidth = cols * (imageSize + padding);
            const gridHeight = rows * (imageSize + padding);
            
            const startX = (canvasWidth - gridWidth) / 2 + padding / 2;
            const startY = 130;
            
            let index = 0;
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    if (index >= profilePics.length) break;
                    
                    const { image, isAdmin } = profilePics[index];
                    const x = startX + col * (imageSize + padding);
                    const y = startY + row * (imageSize + padding);
                    
                    ctx.save();
                    ctx.beginPath();
                    const centerX = x + imageSize / 2;
                    const centerY = y + imageSize / 2;
                    const radius = imageSize / 2;
                    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                    ctx.closePath();
                    ctx.clip();
                    ctx.drawImage(image, x, y, imageSize, imageSize);
                    ctx.restore();
                    
                    let borderColor;
                    if (isAdmin) {
                        borderColor = '#ffd700';
                    } else {
                        const colors = ['#ff5722', '#2196f3', '#4caf50', '#e91e63', '#ff9800', '#9c27b0'];
                        borderColor = colors[index % colors.length];
                    }
                    
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                    ctx.lineWidth = 5;
                    ctx.strokeStyle = borderColor;
                    ctx.stroke();
                    
                    if (isAdmin) {
                        ctx.beginPath();
                        ctx.arc(centerX, centerY, radius + 3, 0, Math.PI * 2);
                        ctx.shadowColor = '#ffd700';
                        ctx.shadowBlur = 15;
                        ctx.lineWidth = 2;
                        ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
                        ctx.stroke();
                    }
                    
                    ctx.shadowBlur = 0;
                    index++;
                }
            }

            const footerY = canvasHeight - 80;
            ctx.beginPath();
            ctx.moveTo(canvasWidth * 0.2, footerY - 20);
            ctx.lineTo(canvasWidth * 0.8, footerY - 20);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(0, footerY - 10, canvasWidth, 70);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 28px Arial, sans-serif';
            ctx.textAlign = 'left';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 5;
            ctx.fillText(`Total Members: ${totalMembers}`, canvasWidth * 0.1, footerY + 35);
            
            ctx.textAlign = 'right';
            ctx.fillText(`Admins: ${adminCount}`, canvasWidth * 0.9, footerY + 35);
            ctx.shadowBlur = 0;

            const timestamp = new Date().toLocaleString();
            ctx.font = '16px Arial, sans-serif';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.textAlign = 'right';
            ctx.fillText(timestamp, canvasWidth - 20, canvasHeight - 15);

            const tempDir = path.join(__dirname, '..', '..', 'temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            const fileName = `gcpic_${crypto.randomBytes(8).toString('hex')}.png`;
            filePath = path.join(tempDir, fileName);

            const out = fs.createWriteStream(filePath);
            const stream = canvas.createPNGStream({ quality: 0.95 });
            stream.pipe(out);

            await new Promise((resolve, reject) => {
                out.on('finish', resolve);
                out.on('error', reject);
            });

            const stats = fs.statSync(filePath);
            if (stats.size === 0) throw new Error("Generated image file is empty");

            const senderInfo = await new Promise((resolve, reject) => {
                api.getUserInfo([senderID], (err, info) => {
                    if (err) reject(err);
                    else resolve(info);
                });
            });
            const userName = senderInfo[senderID]?.name || "Unknown User";

            const msg = {
                body: `${config.bot.botName}: ✨ Here's your YouTube-style group canvas for "${groupName}"! ✨`,
                attachment: fs.createReadStream(filePath)
            };

            logger.info(`Sending YouTube-style group canvas image for: ${groupName}`);
            await new Promise((resolve, reject) => {
                api.sendMessage(msg, threadID, (err) => {
                    if (err) return reject(err);
                    api.setMessageReaction("🎨", messageID, () => {}, true);
                    resolve();
                }, messageID);
            });
            logger.info("Group canvas image sent successfully");

            fs.unlinkSync(filePath);
            logger.info(`[Gcpic Command] Generated YouTube-style group canvas image for "${groupName}" for ${userName}`);
        } catch (err) {
            logger.error(`Error in gcpic command: ${err.message}`, { stack: err.stack });

            api.setMessageReaction("❌", messageID, () => {}, true);
            await api.sendMessage(
                `${config.bot.botName}: ⚠️ Error: ${err.message}`,
                threadID,
                messageID
            );

            if (filePath && fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
    }
};