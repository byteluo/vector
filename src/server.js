const path = require;

const { Git, Log } = require('./service');
const engine = require('./engine');


async function server() {
    const repoes = engine.getConfig().gitRepoes;
    for (let i = 0; i < repoes.length; i++) {
        const gitUrl = repoes[i].url;
        const git = new Git(gitUrl);
        try {
            await git.init();
        } catch (err) {
            Log.error('Maybe limit of authority', err);
        }
        await git.pull();
        let distDir = engine.getConfig().distDir;
        if (repoes[i].tag !== '_ROOT') {
            distDir = path.resolve(distDir, repoes[i].tag);
        }
        engine.startRender({ sourceDir: git.cwd, distDir: distDir });
    }
}

(function round() {
    setTimeout(async () => {
        Log.info('New Round', new Date());
        await server();
        round();
    }, 3000);
})();
