const fs = require('fs/promises');

const argv = require('argv');

const Config = require('./config');
const service = require('../service');

async function parseArge() {
    const { Log } = service;
    const { options } = argv
        .option({
            name: 'config',
            short: 'cfg',
            type: 'string',
            description: 'Specify the config file path.',
        })
        .run();

    const { config: configArg } = options;
    if (configArg) {
        try {
            const configContent = await fs.readFile(configArg);
            Config.setConfig(JSON.parse(configContent));
        } catch (err) {
            Log.error('Read Config File Failed', err);
        }
    }
}

module.exports = {
    parseArge,
};
