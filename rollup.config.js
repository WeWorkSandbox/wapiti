import typescript from "rollup-plugin-typescript2";
import commonjs from "rollup-plugin-commonjs";
import external from "rollup-plugin-peer-deps-external";
import resolve from "rollup-plugin-node-resolve";
import babel from 'rollup-plugin-babel';
import autoExternal from 'rollup-plugin-auto-external';
import json from 'rollup-plugin-json';
import replace from 'rollup-plugin-re';

import pkg from "./package.json";

import postcss from 'rollup-plugin-postcss';
import postcssModules from 'postcss-modules';
const cssExportMap = {};

export default {
  input: "src/index.tsx",
  output: [
    {
      file: pkg.main,
      format: "cjs",
      exports: "named",
      sourcemap: true
    },
    {
      file: pkg.module,
      format: "es",
      exports: "named",
      sourcemap: true
    }
  ],
  plugins: [
    external(),
    autoExternal(),
    resolve(),
    json(),
    // HACK: removes formidable's attempt to overwrite `require`
    replace({
      patterns: [
        {
          // regexp match with resolved path
          match: /formidable(\/|\\)lib/, 
          // string or regexp
          test: 'if (global.GENTLY) require = GENTLY.hijack(require);', 
          // string or function to replaced with
          replace: '',
        }
      ]
    }),
    postcss({
      plugins: [
        postcssModules({
          getJSON (id, exportTokens) {
            cssExportMap[id] = exportTokens;
          }
        })
      ],
      getExportNamed: false,
      getExport (id) {
        return cssExportMap[id];
      },
      extract: 'build/styles.css',
    }),
    typescript({
      rollupCommonJSResolveHack: true,
      exclude: "**/__tests__/**",
      clean: true
    }),
    babel({
      exclude: 'node_modules/**'
    }),
    commonjs({
      include: ["node_modules/**"],
      namedExports: {
        "node_modules/react/react.js": [
          "Children",
          "Component",
          "PropTypes",
          "createElement"
        ],
        "node_modules/protobufjs/index.js":[
          "Enum",
          "Field",
          "MapField",
          "Method",
          "OneOf",
          "Service",
          "Namespace",
          "Type",
          "load",
        ],
        "node_modules/react-dom/index.js": ["render"]
      }
    })
  ]
};
