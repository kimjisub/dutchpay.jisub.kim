module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint', 'simple-import-sort', 'unused-imports'],
	overrides: [
		{
			files: ['*.ts', '*.tsx'],
			rules: {
				'@typescript-eslint/no-shadow': ['error'],
				'no-shadow': 'off',
				'no-undef': 'off',
				'simple-import-sort/imports': [
					'error',
					{
						groups: [
							// Packages. `react` related packages come first.
							['^react', '^@?\\w'],
							// Side effect imports.
							['^\\u0000'],
							// Internal packages.
							['^(@\\/)(.*|$)', '^(@images)(.*|$)'],
							// Parent imports. Put `..` last.
							['^\\.\\.(?!/?$)', '^\\.\\./?$'],
							// Other relative imports. Put same-folder imports and `.` last.
							['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
						],
					},
				],
				'unused-imports/no-unused-imports': 'error',
				'react-native/no-inline-styles': 0,
			},
		},
	],
}
