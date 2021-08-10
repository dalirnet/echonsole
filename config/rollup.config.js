import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from '@rollup/plugin-babel'
import { uglify } from 'rollup-plugin-uglify'

export default {
    input: 'client/index.js',
    output: {
        file: 'dist/echonsole.js',
        format: 'cjs',
    },
    plugins: [
        resolve({
            browser: true,
        }),
        commonjs(),
        babel({
            include: ['**.js', 'node_modules/**'],
            babelHelpers: 'bundled',
            presets: ['@babel/preset-env'],
        }),
        uglify(),
    ],
}
