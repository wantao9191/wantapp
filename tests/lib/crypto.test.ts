import { describe, it, expect, beforeEach } from 'vitest'
import { encryptString, decryptString, encryptJson, decryptJson } from '@/lib/crypto'

function setKey(bytes = 32) {
  const key = Buffer.alloc(bytes, 1).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
  process.env.DATA_ENCRYPTION_KEY = key
}

describe('crypto', () => {
  beforeEach(() => setKey())

  it('encrypt/decrypt string', async () => {
    const token = await encryptString('hello')
    const plain = await decryptString(token)
    expect(plain).toBe('hello')
  })

  it('encrypt/decrypt json', async () => {
    const token = await encryptJson({ a: 1 })
    const obj = await decryptJson<{ a: number }>(token)
    expect(obj.a).toBe(1)
  })
})


