import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import browsersync from 'rollup-plugin-browsersync';
import pkg from './package.json';

export default {
  input: 'src/index.js',
  output: {
    file: pkg.browser,
    name: 'Limelight',
    format: 'umd',
    extend: true,
    sourcemap: true,
  },
  plugins: [
    resolve(),
    commonjs({
      include: 'node_modules/**',
    }),
    typescript({
      abortOnError: false,
    }),
    ...(process.env.BUILD !== 'production' ? [
      browsersync({
        server: '.',
        files: ['dist/**/*.*', 'src/styles/*.css', '*.html'],
      }),
    ] : []),
  ],
};
