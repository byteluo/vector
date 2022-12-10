const { parseArgs, startRender } = require('./engine');

parseArgs().then(() => {
    startRender();
});
