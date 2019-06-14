import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
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
    typescript({
      abortOnError: false,
    }),
    ...(process.env.BUILD !== 'production' ? [
      browsersync({
        server: '.',
        files: ['dist/**/*.*', 'src/styles/*.css', '*.html'],
      }),
    ] : [
      terser(),
    ]),
  ],
};
