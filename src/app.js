const fs = require('fs/promises');

const argv = require('argv');

const { config, setConfig } = require('./config');
const { startRender } = require('./engine');
const { Log } = require('./service');

const { options } = argv
    .option({
        name: 'config',
        short: 'cfg',
        type: 'string',
        description: 'Specify the config file path.',
    })
    .run();

const { config: configArg } = options;

(async function () {
    if (configArg) {
        try {
            const configContent = await fs.readFile(configArg);
            setConfig(JSON.parse(configContent));
        } catch (err) {
            Log.error('Read Config File Failed', err);
        }
    }
    startRender(config);
})();
