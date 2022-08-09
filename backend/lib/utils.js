const tee = (fn) => (val) =>  (fn(val), val);

export { tee };