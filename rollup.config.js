import babel from 'rollup-plugin-babel';
import babelrc from 'babelrc-rollup';
import browsersync from 'rollup-plugin-browsersync';

const babelConfig = {
  'presets': [
    ['env', {
      'targets': {
        'browsers': ['last 2 versions']
      },
      'loose': true
    }]
  ]
};

export default {
  input: 'src/index.js',
  plugins: [
    babel(babelrc({
      addExternalHelpersPlugin: false,
      config: babelConfig,
      exclude: 'node_modules/**'
    }))
  ],
  output: {
    file: 'dist/bundle.js',
    name: 'Bundle',
    sourcemap: true,
    format: 'umd',
  },
  plugins: [
    browsersync({ server: '.' })
  ],
};
