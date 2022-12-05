function parallelRun(arr, handler) {
    return Promise.all(arr.map(handler))
}

module.exports = {
    parallelRun,
}
