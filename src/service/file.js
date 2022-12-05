const fs = require('fs/promises')
const path = require('path')

const fm = require('front-matter')

const { parallelRun } = require('./promise')
const { getStringMD5 } = require('./md5')

const { resolve } = path

async function isFileExist(filePath) {
    try {
        const s = await fs.stat(filePath)
        return s.isFile()
    } catch (e) {
        return false
    }
}

async function isDirExist(dirPath) {
    try {
        const s = await fs.stat(dirPath)
        return s.isDirectory()
    } catch (e) {
        return false
    }
}

async function ensureDirExist(dirPath) {
    ;(await isDirExist(dirPath)) ||
        (await fs.mkdir(dirPath, { recursive: true }))
}

async function ensureParentDirExit(filePath) {
    const parentPath = path.dirname(filePath)
    await ensureDirExist(parentPath)
}

async function readDir(dirPath) {
    const subFilePaths = (await fs.readdir(dirPath)).map((file) =>
        resolve(dirPath, file)
    )

    const fileFlags = await parallelRun(subFilePaths, async (filePath) => {
        return (await fs.stat(filePath)).isFile()
    })

    return subFilePaths.map((path, index) => ({
        path,
        isFile: fileFlags[index],
    }))
}

async function collectAllFilesInDir(path) {
    const arr = []
    const files = await readDir(path)
    await parallelRun(files, async (file) => {
        if (file.isFile) {
            arr.push(file.path)
        } else {
            arr.push(...(await collectAllFilesInDir(file.path)))
        }
    })
    return arr
}

async function readMarkdownFile(filePath) {
    const mtime = (await fs.stat(filePath)).mtime.getTime()
    const ctime = (await fs.stat(filePath)).ctime.getTime()

    const fileContent = (await fs.readFile(filePath)).toString()
    const { attributes, body: content } = fm(fileContent)

    const id = attributes.id || getStringMD5(filePath)
    const filename = encodeURIComponent(
        path.basename(filePath).replace(new RegExp('.md$'), '')
    )
    const title = attributes.title || filename
    const md5 = getStringMD5(content)

    return {
        ctime,
        mtime,
        ...attributes,
        _path: filePath,
        id,
        title,
        md5,
        content,
    }
}

module.exports = {
    ensureDirExist,
    isDirExist,
    isFileExist,
    readDir,
    collectAllFilesInDir,
    readMarkdownFile,
    ensureParentDirExit,
}
