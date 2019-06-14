function mergeOptions(defaultOptions = {}, userOptions = {}) {
  return Object.keys(defaultOptions)
    .reduce((obj, key) => (
      Object.assign(obj, {
        [key]: userOptions[key] !== undefined
          ? userOptions[key]
          : defaultOptions[key],
      })
    ), {});
}

function uid() {
  return Math.random().toString(36).substr(2, 9);
}


function generateIndexArr(length) {
  return Array(length).fill(0).map((_, i) => i + 1);
}

export default {
  mergeOptions,
  uid,
  generateIndexArr,
};
