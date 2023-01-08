const path = require('path');

const config = {
    sourceDir: path.resolve('source'),
    distDir: path.resolve('api'),
    dataDir: path.join('data'),
    encryptKey: '123456',
    gitRepoes: [{ tag: '_ROOT', url: 'git@gitee.com:bytesci/treecat-doc.git' }],
    imagePrefix: 'https://127.0.0.1:4000',
};

function setConfig(userConfig) {
    Object.assign(config, userConfig);
}

function getConfig() {
    return config;
}

function resetConfig() {}

module.exports = {
    resetConfig,
    getConfig,
    setConfig,
};
