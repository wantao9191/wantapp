import { beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from '@/app/api/admin/login/route'

const cookieStore = new Map<string, string>()
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (k: string) => cookieStore.has(k) ? { name: k, value: cookieStore.get(k)! } : undefined,
    set: (k: string, v: string) => { cookieStore.set(k, v) },
    delete: (k: string) => { cookieStore.delete(k) },
  }),
}))

vi.mock('@/db', () => ({ db: { select: () => ({ from: () => ({ where: () => ({ limit: () => Promise.resolve([{ id: '1', username: 'u', password: '$2a$04$123456789012345678901u8d7p3wLQ6w8rY', role: 'user' }]) }) }) }) } }))
vi.mock('@/db/schema', () => ({ users: {} }))
vi.mock('drizzle-orm', () => ({ eq: () => ({}) }))

vi.mock('@/lib/crypto', () => ({ decryptJson: async () => ({ code: '1234' }) }))
vi.mock('@/lib/validations', () => ({ loginSchema: { safeParse: (x: any) => ({ success: true, data: x }) } }))
vi.mock('@/lib/password', () => ({ verifyPassword: async (plain: string) => plain === 'pwd' }))
vi.mock('@/lib/jwt', () => ({ signAccessToken: async () => 'jwt-token' }))

function mockNextJson(body: any) {
  return new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } }) as any
}

describe('api/admin/login POST', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('成功登录返回 token 和用户信息', async () => {
    const req = new Request('http://localhost/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'u', password: 'pwd', code: '1234' }),
      headers: { 'content-type': 'application/json' },
    }) as any

    // 注入 cookie: captcha
    cookieStore.set('captcha', JSON.stringify({ code: '1234' }))

    const res: any = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.code).toBe(200)
    expect(body.data.token).toBe('jwt-token')
  })
})


