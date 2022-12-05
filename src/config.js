const path = require('path')

const config = {
    sourceDir: path.resolve('source'),
    distDir: path.resolve('dist'),
    dataDir: path.join('data'),
    encryptKey: '123456',
}

function setConfig(userConfig) {
    Object.assign(config, userConfig)
}

module.exports = {
    config,
    setConfig,
}
