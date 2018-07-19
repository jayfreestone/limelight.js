import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import browsersync from 'rollup-plugin-browsersync';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.js',
    name: 'Limelight',
    sourcemap: true,
    format: 'umd',
    extend: true,
  },
  plugins: [
    resolve(),
    commonjs({
      include: 'node_modules/**',
    }),
    typescript({
      abortOnError: false,
    }),
    browsersync({
      server: '.',
      files: ['dist/**/*.*', 'src/styles/*.css', '*.html'],
    }),
  ],
};
