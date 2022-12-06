const path = require('path');

const { renderMarkdown } = require('../service');
const { config } = require('../config');

const { join } = path;

const hooks = [];

function setHook(name, hook) {
    hooks.push({ name, hook });
}

setHook('markdown', (items) =>
    items.map((item) => {
        item.content = item.content && renderMarkdown(item.content, item._private.path);
        return item;
    })
);

setHook('encrypt', (items) =>
    items.map((item) => {
        return item;
    })
);

setHook('core', (items) => {
    const JSON_POSTFIX = '.json';

    // build map
    const map = {};
    items.forEach((item) => {
        map[item.id] = item;
    });

    // build linked obj
    items
        .filter((item) => item._private.list && item.items)
        .forEach((item) => {
            item.items = item.items.map((itemId) => {
                const linkedObj = map[itemId];
                linkedObj._private.linked = true;
                const { id, title, mtime } = linkedObj;
                return {
                    id,
                    title,
                    mtime,
                };
            });
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
