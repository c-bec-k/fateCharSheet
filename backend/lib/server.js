// const pipeAsync = (...fns) => (...init) => fns.reduce( (val, fn) => fn(val), Promise.resolve(...init));

const pipeHTTP = (...fns) => (req, res) => fns.reduce( (promise, fn) => promise.then(fn), Promise.resolve({req,res}));

export { pipeHTTP }