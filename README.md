# Vector

Vector is a Restful API for personal blog.

[Live Demo](https://treecat.cn)

## Usage

You could use vector by executable program or node.js source code.

Put your markdown file in `source` directory, and then run `vector.exe`

```
./vector.exe
```

For high-end players, you could modify source code, and then run `node src/app.js`

## Advanced

Convention over configuration.

### Vector Config

You could create a `vector.config` file in the same directory of `vector.exe`.

```
{
    sourceDir: "source",
    distDir: "dist",
    encryptKey: '123456',
};
```

### Markdown Config

* **except** Not Render this File.
* **lock** Use `VectorConfig.encryptKey` encrypt this article.


