import { describe, it, expect } from 'vitest'
import { ok, error, methodNotAllowed, badRequest, unauthorized, forbidden, notFound } from '@/app/api/_utils/response'

function readJson(res: Response) { return res.json() as Promise<any> }

describe('api/_utils/response', () => {
  it('ok()', async () => {
    const res: any = ok({ a: 1 }, 'OK')
    const body = await readJson(res)
    expect(body).toEqual({ code: 200, message: 'OK', data: { a: 1 } })
  })

  it('error()', async () => {
    const res: any = error('oops', 500)
    expect(res.status).toBe(500)
    const body = await readJson(res)
    expect(body).toEqual({ code: 500, message: 'oops' })
  })

  it('methodNotAllowed()', async () => {
    const res: any = methodNotAllowed(['GET', 'POST'])
    expect(res.status).toBe(405)
    expect(res.headers.get('Allow')).toBe('GET, POST')
  })

  it('shortcuts', async () => {
    expect((await readJson(badRequest())).code).toBe(400)
    expect((await readJson(unauthorized())).code).toBe(401)
    expect((await readJson(forbidden())).code).toBe(403)
    expect((await readJson(notFound())).code).toBe(404)
  })
})


