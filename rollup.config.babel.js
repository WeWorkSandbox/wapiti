import path from 'path';
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-re';
import postcss from 'rollup-plugin-postcss';
import json from 'rollup-plugin-json';
import external from 'rollup-plugin-peer-deps-external'

export default {
  input: './src/index.js',
  moduleName: 'wapiti',
  sourcemap: true,
  external: ['react','react-dom','url','crypto','os','tty','node-readfiles','node-fetch-h2','path','stream','http','https','fs','zlib'],

  targets: [
    {
      dest: './build/wapiti.js',
      format: 'umd'
    },
    {
      dest: 'build/wapiti.module.js',
      format: 'es'
    }
  ],

  plugins: [
    external(),
    postcss({
      modules: true
    }),
    json(),
    babel({
      exclude: 'node_modules/**'
    }),
    // HACK: removes formidable's attempt to overwrite `require`
    replace({
      patterns: [
        {
          test: /process\.env\.NODE_ENV/,
          replace: "JSON.stringify('development')"
        },
        {
          // regexp match with resolved path
          match: /formidable(\/|\\)lib/,
          // string or regexp
          test: 'if (global.GENTLY) require = GENTLY.hijack(require);',
          // string or function to replaced with
          replace: '',
        },
        {
          match: /types\.js$/,
          test: /util\.emptyArray/,
          replace: "Object.freeze ? Object.freeze([]) : []"
        },
        {
          match: /root\.js/,
          test: /util\.path\.resolve/,
          replace: "require('@protobufjs/path').resolve"
        }
      ]
    }),
    resolve(),
    commonjs({
      namedExports: {
        "node_modules/protobufjs/index.js":[
          "Enum",
          "Field",
          "MapField",
          "Method",
          "OneOf",
          "Service",
          "Namespace",
          "Type",
          "load"
        ]
      }
    })
  ],

  globals: {
    react: 'React',
    'react-dom': 'ReactDOM'
  }
};
