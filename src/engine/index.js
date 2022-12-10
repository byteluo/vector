const engine = require('./engine');
const parseArgs = require('./parseArgs');
const config = require('./config');

module.exports = {
    startRender: engine.startRender,
    parseArgs: parseArgs.parseArge,
    getConfig: config.getConfig,
};
