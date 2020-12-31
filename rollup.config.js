import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';

export default [
	{
		input: './src/bilibili-random.ts',
		output: { file: 'dist/bilibili-random.js', format: 'iife' },

		plugins: [
			nodeResolve(),
			commonjs(),
			typescript(),
		],
	},
]
