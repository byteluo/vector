const { renderMarkdown } = require('./markdown')
const os = require('os')
const fs = require('fs/promises')
const path = require('path')

const { resolve } = path

const VECTOR_TEST_DIR = path.resolve(os.tmpdir(), 'vector.test')

test('markdown.renderMarkdown', async () => {
    const targetPath = resolve(VECTOR_TEST_DIR, 'markdown.renderMarkdown')
    await fs.rmdir(targetPath, { force: true, recursive: true })

    const result = renderMarkdown('![]()\n# 你好', targetPath).split('\n')
    expect(result[0]).toBe('<p><img src="/images/error.jpg" alt=""></p>')
    expect(result[1]).toBe('<h1>你好</h1>')
})
