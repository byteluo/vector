const path = require('path');
const _ = require('lodash');
const { renderMarkdown, encryptString } = require('../service');
const Config = require('../engine/config');

const { join } = path;

const hooks = [];

function setHook(name, hook) {
    hooks.push({ name, hook });
}

function isDirectoryItem(item) {
    return item._private.list && item.items;
}

setHook('markdown', (items) =>
    items.map((item) => {
        item.content =
            item.content && renderMarkdown(item.content, item._private.path);
        return item;
    })
);

setHook('encrypt', (items) =>
    items.map((item) => {
        if (item.lock) {
            if (item.lock === true) {
                item.content = encryptString(
                    item.content,
                    Config.getConfig().encryptKey
                );
            } else if (_.isString(item.lock)) {
                item.content = encryptString(item.content, item.lock);
            }
        }
        return item;
    })
);

setHook('except', (items) => {
    const map = {};
    items.forEach((item) => {
        map[item.id] = item;
    });

    items = items.filter((item) => !item._private.except);
    items.filter(isDirectoryItem).forEach((item) => {
        item.items = item.items.filter((id) => {
            return !map[id].except;
        });
    });
    return items;
});

setHook('core', (items) => {
    const config = Config.getConfig();

    const JSON_POSTFIX = '.json';

    // build map
    const map = {};
    items.forEach((item) => {
        map[item.id] = item;
    });

    // build linked obj
    items.filter(isDirectoryItem).forEach((item) => {
        item.items = item.items
            .map((itemId) => {
                const linkedObj = map[itemId];
                if (!linkedObj) {
                    return;
                }
                linkedObj._private.linked = true;
                const { id, title, mtime } = linkedObj;
                return {
                    id,
                    title,
                    mtime,
                };
            })
            .filter((item) => item && !item.except);
    });

    // generate save path
    items.forEach((item) => {
        const { _private, id } = item;
        if (_private.path && _private.path.startsWith(config.sourceDir)) {
            let savePath = join(
                config.distDir,
                _private.path.replace(config.sourceDir, '')
            );
            if (_private.linked) {
                const dir = path.dirname(savePath);
                savePath = path.resolve(dir, id + JSON_POSTFIX);
            } else if (!savePath.endsWith(JSON_POSTFIX)) {
                savePath = savePath.replace(
                    new RegExp(`${path.extname(savePath)}$`),
                    '.json'
                );
            }
            _private.savePath = savePath;
        }
    });

    return items;
});

module.exports = {
    hooks,
};
