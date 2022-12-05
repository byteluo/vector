const { getStringMD5 } = require('./md5')

test('md5.getStringMD5', async () => {
    expect(getStringMD5('hello world')).toBe('5eb63bbbe01eeed093cb22bb8f5acdc3')
})
