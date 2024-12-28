import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { defineConfig } from 'rollup';
import pkg from './package.json' with { type: 'json' };

const OUTPUT_DIR = 'dist';
const ENTRY_NAME = 'index';

const esmConfig = defineConfig({
  input: `src/${ENTRY_NAME}.ts`,
  output: [
    {
      format: 'es',
      sourcemap: true,
      file: `${OUTPUT_DIR}/${ENTRY_NAME}.mjs`
    }
  ],
  plugins: [
    typescript({ tsconfig: './tsconfig.json' }), //
    nodeResolve() //
  ],
  external: Object.keys(pkg.peerDependencies ?? {})
});
const cjsConfig = defineConfig({
  input: `src/${ENTRY_NAME}.ts`,
  output: [
    {
      format: 'cjs',
      sourcemap: true,
      file: `${OUTPUT_DIR}/${ENTRY_NAME}.js`
    }
  ],
  plugins: [
    typescript({ tsconfig: './tsconfig.json' }), //
    nodeResolve({
      exportConditions: ['default', 'node', 'browser'],
      preferBuiltins: true
    })
  ],
  external: Object.keys(pkg.peerDependencies ?? {})
});

export default [esmConfig, cjsConfig];
