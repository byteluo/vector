const path = require('path');
const fs = require('fs/promises');
const os = require('os');

const axios = require('axios');
const MarkdownIt = require('markdown-it');

const {
    collectAllFilesInDir,
    ensureParentDirExit,
    isFileExist,
} = require('./file');
const { getStringMD5 } = require('./md5');
const { parallelRun } = require('./promise');
const Log = require('./log');
const { resolve } = require('path');

const fileCacheContainer = {};
const CACHE_FILE_PATH = path.resolve(os.tmpdir(), 'vector.image.cache.json');

async function loadCache(dstImageDir) {
    const b = await isFileExist(CACHE_FILE_PATH);
    if (b) {
        const cacheContent = await fs.readFile(CACHE_FILE_PATH);
        const obj = JSON.parse(cacheContent);
        await parallelRun(Object.entries(obj), async ([key, value]) => {
            const b = await isFileExist(path.resolve(dstImageDir, value));
            if (b) {
                fileCacheContainer[key] = value;
            }
        });
    }
}

async function saveCache() {
    await fs.writeFile(CACHE_FILE_PATH, JSON.stringify(fileCacheContainer));
}

async function handleMarkdownImage(sourceDir, distDir) {
    const MARKDOWN_IMAGE_PATTERN = /!\[(.*?)\]\((.*?)\)/gm;
    const HTTP_PREFIX = 'http';

    await loadCache(resolve(distDir, 'images'));

    const allFiles = await collectAllFilesInDir(sourceDir);
    const files = allFiles.filter((file) => path.extname(file) === '.md');
    await parallelRun(files, async (file) => {
        const content = (await fs.readFile(file)).toString();
        let matcher;
        while ((matcher = MARKDOWN_IMAGE_PATTERN.exec(content)) !== null) {
            let imageUrl = matcher[2];

            try {
                if (!imageUrl.startsWith(HTTP_PREFIX)) {
                    imageUrl = path.resolve(path.dirname(file), imageUrl);
                }

                if (fileCacheContainer[imageUrl]) {
                    continue;
                }

                let imageContent;
                if (imageUrl.startsWith(HTTP_PREFIX)) {
                    Log.info('download image', imageUrl);

                    let { data } = await axios({
                        url: imageUrl,
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                        responseType: 'arraybuffer',
                    });

                    imageContent = data;
                } else {
                    imageContent = await fs.readFile(imageUrl);
                }

                const filename = getStringMD5(imageContent.toString()) + '.jpg';
                const dstFilePath = path.resolve(distDir, 'images', filename);

                await ensureParentDirExit(dstFilePath);
                await fs.writeFile(dstFilePath, imageContent);
                fileCacheContainer[imageUrl] = filename;
            } catch (err) {
                Log.error('handle image error', imageUrl);
            }
        }
    });
    await saveCache();
}

const md = MarkdownIt({ html: true });
const rawImageRender = md.renderer.rules.image;

md.renderer.rules.image = function (tokens, _a, _b, { imageBasePath }) {
    tokens
        .filter((token) => token.type === 'image')
        .forEach((imgToken) => {
            imgToken.attrs.forEach((bundle) => {
                const [srcTag, srcValue] = bundle;
                if (srcTag === 'src') {
                    let url = srcValue;
                    if (!srcValue.startsWith('http')) {
                        url = path.resolve(imageBasePath, url);
                    }
                    bundle[1] =
                        '/images/' + (fileCacheContainer[url] || 'error.jpg');
                }
            });
        });

    return rawImageRender && rawImageRender(...arguments);
};

function renderMarkdown(content, imageBasePath) {
    return md.render(content, { imageBasePath });
}

module.exports = {
    handleMarkdownImage,
    renderMarkdown,
};
