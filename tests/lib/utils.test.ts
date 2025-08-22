import { describe, it, expect } from 'vitest'
import { cn, formatDate, generateRandomString, delay, truncate, slugify, isValidEmail, safeJsonParse } from '@/lib/utils'

describe('utils', () => {
  it('cn merges class names', () => {
    expect(cn('a', false && 'b', ['c'])).toContain('a')
  })

  it('formatDate returns zh-CN date', () => {
    const s = formatDate('2023-01-15')
    expect(s).toMatch(/2023.*1.*15/)
  })

  it('generateRandomString returns expected length', () => {
    const r = generateRandomString(12)
    expect(r).toHaveLength(12)
  })

  it('delay resolves', async () => {
    const start = Date.now()
    await delay(10)
    expect(Date.now() - start).toBeGreaterThanOrEqual(10)
  })

  it('truncate works', () => {
    expect(truncate('hello', 10)).toBe('hello')
    expect(truncate('hello world', 5)).toBe('hello...')
  })

  it('slugify works', () => {
    expect(slugify('Hello, World!  ')).toBe('hello-world')
  })

  it('isValidEmail works', () => {
    expect(isValidEmail('a@b.com')).toBe(true)
    expect(isValidEmail('bad@com')).toBe(false)
  })

  it('safeJsonParse returns fallback on invalid json', () => {
    expect(safeJsonParse('{', 1)).toBe(1)
    expect(safeJsonParse('{"a":1}', 0) as any).toEqual({ a: 1 })
  })
})


