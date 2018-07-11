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

export default {
  mergeOptions,
};
