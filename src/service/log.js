const c = require('ansi-colors');

function error(title, content) {
    console.log(c.red(title));
    console.log(content, '\n');
}

function info(title, content) {
    console.log(c.green(title));
    console.log(content, '\n');
}

module.exports = {
    error,
    info,
};
