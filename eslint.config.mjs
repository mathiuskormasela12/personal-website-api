// ESLint 10 flat config (replaces the old .eslintrc.js).
import tseslint from 'typescript-eslint'
import prettierRecommended from 'eslint-plugin-prettier/recommended'

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'coverage', 'screenshoot', 'eslint.config.mjs'] },
  ...tseslint.configs.recommended,
  prettierRecommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
)
