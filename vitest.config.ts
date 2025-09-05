/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    include: ['tests/**/*.test.{ts,tsx}'],
    reporters: ['default'],
    environment: 'jsdom',
    setupFiles: ['tests/setup/ui.setup.ts'],
  },
})


