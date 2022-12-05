const path = require('path')

const { renderMarkdown } = require('../service')
const { config } = require('../config')

const { join } = path

const hooks = []

function setHook(name, hook) {
    hooks.push({ name, hook })
}

setHook('markdown', (items) =>
    items.map((item) => {
        item.content = item.content && renderMarkdown(item.content, item._path)
        return item
    })
)

setHook('encrypt', (items) =>
    items.map((item) => {
        return item
    })
)

setHook('core', (items) => {
    const JSON_POSTFIX = '.json'

    // build map
    const map = {}
    items.forEach((item) => {
        map[item.id] = item
    })

    // build linked obj
    items
        .filter((item) => item._list && item.items)
        .forEach((item) => {
            item.items = item.items.map((itemId) => {
                const linkedObj = map[itemId]
                linkedObj._linked = true
                const { id, title, mtime } = linkedObj
                return {
                    id,
                    title,
                    mtime,
                }
            })
        })

    // generate save path
    items.forEach((item) => {
        const { _path, _linked, id } = item
        if (_path && _path.startsWith(config.sourceDir)) {
            let savePath = join(
                config.distDir,
                _path.replace(config.sourceDir, '')
            )
            if (_linked) {
                const dir = path.dirname(savePath)
                savePath = path.resolve(dir, id + JSON_POSTFIX)
            } else if (!savePath.endsWith(JSON_POSTFIX)) {
                savePath = savePath.replace(
                    new RegExp(`${path.extname(savePath)}$`),
                    '.json'
                )
            }
            item.savePath = savePath
        }
    })

    // remove hidden properties
    return items.map((item) => {
        const { _list, _linked, _path, ...otherProperties } = item
        return otherProperties
    })
})

module.exports = {
    hooks,
}
