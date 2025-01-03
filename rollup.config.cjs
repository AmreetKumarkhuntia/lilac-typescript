import typescript from '@rollup/plugin-typescript';

export default {
  input: 'index.ts',
  output: [
    // for es6 exports
    {
      dir: 'dist',
      format: 'es',
      sourcemap: true,
    },
  ],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json', // Use tsconfig.json for TypeScript options
      declaration: true, // Generate .d.ts declaration files
      declarationDir: 'dist/', // Output .d.ts files to 'dist/types'
      sourceMap: true, // Generate source maps for declaration files
    }),
  ],
  external: [
    'tslib',
    ...Object.keys(require('./package.json').dependencies || {}),
  ],
};
