const path = require('path');
const fs = require('fs/promises');

const service = require('./service');
const Hook = require('./hook');
const Config = require('./config');

const {
    handleMarkdownImage,
    Log,
    isFileExist,
    readDir,
    readMarkdownFile,
    ensureParentDirExit,
    getStringMD5,
} = require('./service');

const { resolve } = path;

async function readWebsiteData(dirPath) {
    const IGNORE_PREFIX = '_';
    const LIST_FILE_NAME = 'list.json';

    if (path.basename(dirPath).startsWith(IGNORE_PREFIX)) {
        return;
    }

    const dirObj = {
        id: getStringMD5(resolve(dirPath)),
        _private: {
            path: resolve(dirPath, LIST_FILE_NAME),
            list: false
        }
    };
    const result = [];

    const files = await readDir(dirPath);

    const dirConfigFile = resolve(dirPath, LIST_FILE_NAME);
    if (await isFileExist(dirConfigFile)) {
        dirObj._private.list = true;
        const config = JSON.parse(await fs.readFile(dirConfigFile));
        Object.assign(dirObj, config);
        result.push(dirObj);
    }

    const markdownFiles = files.filter(
        (el) => el.isFile && el.path.endsWith('.md')
    );

    // empty dir
    if (markdownFiles.length === 0 && !(await isFileExist(dirConfigFile))) {
        return;
    }

    const fileObjs = await service.parallelRun(markdownFiles, (file) =>
        readMarkdownFile(file.path)
    );
    result.push(...fileObjs);

    dirObj.items = fileObjs.map((obj) => obj.id);

    const subDirs = files.filter((el) => !el.isFile);
    const subDirObjs = await service.parallelRun(subDirs, (dir) =>
        readWebsiteData(dir.path)
    );

    subDirObjs.forEach((obj) => {
        if (obj instanceof Array) {
            result.push(...obj);
        }
    });

    return result;
}

async function startRender() {
    const config = Config.getConfig();
    Log.info('Start Render!', config);
    await handleMarkdownImage(config.sourceDir, config.distDir);
    const websiteData = await readWebsiteData(config.sourceDir);

    // use hooks handle middle data
    const handledData = Hook.setHooks(websiteData);

    await service.parallelRun(handledData, async (obj) => {
        const { _private, ...restProps } = obj;
        await ensureParentDirExit(_private.savePath);
        _private.savePath && await fs.writeFile(_private.savePath, JSON.stringify(restProps));
    });
}

module.exports = {
    startRender,
};
