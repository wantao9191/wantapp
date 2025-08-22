import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  resolve: {
    alias: [
      { find: /^@\/(.*)$/, replacement: path.resolve(__dirname, 'src/$1') },
      { find: '@', replacement: path.resolve(__dirname, 'src') },
    ],
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.{ts,tsx}'],
    reporters: [
      'default',
      ['junit', { outputFile: 'docs/junit.xml' }],
      ['json', { outputFile: 'docs/test-results.json' }],
    ],
    environmentMatchGlobs: [
      ['tests/ui/**', 'jsdom'],
    ],
    setupFiles: ['tests/setup/ui.setup.ts'],
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',
      reporter: ['text', 'html', 'json', 'json-summary', 'lcov'],
      include: [
        'src/lib/**/*.{ts,tsx}',
        'src/components/**/*.{ts,tsx}',
        'src/app/api/_utils/**/*.ts',
        'src/app/api/**/route.ts',
      ],
      exclude: ['**/*.d.ts', 'node_modules/**', '.next/**'],
    },
  },
})


