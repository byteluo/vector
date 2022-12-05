const os = require('os')
const fs = require('fs/promises')
const path = require('path')

const { collectAllFilesInDir, readMarkdownFile } = require('./file')

const { resolve } = path

const VECTOR_TEST_DIR = path.resolve(os.tmpdir(), 'vector.test')

async function makeEmptyDir(dir) {
    await fs.mkdir(dir, { recursive: true })
}

async function makeEmptyFile(file) {
    await makeEmptyDir(path.dirname(file))
    await fs.writeFile(file, '')
}

test('file.collectAllFilesInDir', async () => {
    const targetPath = resolve(VECTOR_TEST_DIR, 'file.collectAllFilesInDir')
    await fs.rmdir(targetPath, { force: true, recursive: true })

    await makeEmptyFile(resolve(targetPath, '1'))
    await makeEmptyFile(resolve(targetPath, '2'))
    await makeEmptyFile(resolve(targetPath, '3'))

    await makeEmptyFile(resolve(targetPath, 'dir1/1'))
    await makeEmptyFile(resolve(targetPath, 'dir1/2'))
    await makeEmptyFile(resolve(targetPath, 'dir1/3'))

    await makeEmptyFile(path.resolve(targetPath, 'dir/dir/dir/dir/6'))

    await makeEmptyDir(path.resolve(targetPath, 'dir2'))
    await makeEmptyDir(path.resolve(targetPath, 'dir3'))

    const files = await collectAllFilesInDir(targetPath)

    expect(files.length).toBe(7)
})

test('file.readMarkdownFile', async () => {
    const targetPath = path.resolve(VECTOR_TEST_DIR, 'file.readMarkdownFile')
    await fs.rmdir(targetPath, { force: true, recursive: true })
    await makeEmptyDir(targetPath)
    await fs.writeFile(
        resolve(targetPath, 'demo.md'),
        '---\ntitle: hello world\n---\nhello world, yeah yeah yeah!'
    )

    const data = await readMarkdownFile(resolve(targetPath, 'demo.md'))
    expect(data.title).toBe('hello world')
    expect(data.content).toBe('hello world, yeah yeah yeah!')
})
