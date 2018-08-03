function mergeOptions(defaultOptions = {}, userOptions = {}) {
  return Object.keys(defaultOptions)
    .reduce((obj, key) => (
      Object.assign(obj, {
        [key]: userOptions[key]
          ? userOptions[key]
          : defaultOptions[key],
      })
    ), {});
}

function uid() {
  return Math.random().toString(36).substr(2, 9);
}

export default {
  mergeOptions,
  uid,
};
