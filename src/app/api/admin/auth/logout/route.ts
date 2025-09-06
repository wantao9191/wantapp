import { NextRequest } from 'next/server'
import { createHandler } from '../../../_utils/handler'
import { cookies } from 'next/headers'

export const POST = createHandler(async (request: NextRequest) => {
  const cookieStore = await cookies()
  cookieStore.delete('access_token')
  return 
}, {
  requireAuth: true
})
