import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json' with { type: "json" };

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
    },
    {
      file: pkg.module,
      format: 'es',
    }
  ],
  plugins: [
    typescript(),
  ],
  external: [
    ...Object.keys(pkg.peerDependencies || {}),
  ],
  onwarn: function(warning) {
    // Skip certain warnings

    // should intercept ... but doesn't in some rollup versions
    if (warning.code === 'THIS_IS_UNDEFINED') {
      return;
    }

    // console.warn everything else
    console.warn(warning.message);
  },
};
