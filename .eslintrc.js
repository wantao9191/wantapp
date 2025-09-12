module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    // 禁用所有 ESLint 规则
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/prefer-nullish-coalescing': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'react-hooks/rules-of-hooks': 'off',
    'import/no-anonymous-default-export': 'off',
  },
}
