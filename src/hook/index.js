const { hooks } = require('./hooks');

function setHooks(data) {
    for (let i = 0; i < hooks.length; i++) {
        const hook = hooks[i].hook;
        data = hook(data);
    }
    return data;
}

module.exports = {
    setHooks,
};
