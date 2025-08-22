import { NextRequest, NextResponse } from 'next/server'
import { createHandler } from '../_utils/handler'
import { generateRandomString } from '@/lib/utils'
import { cookies } from 'next/headers'
import { encryptJson } from '@/lib/crypto'
export const GET = createHandler(async (request: NextRequest) => {
  try {
    const captchaCode = Math.floor(1000 + Math.random() * 9000).toString()
    const captchaId = generateRandomString(16)
    const captchaData = {
      id: captchaId,
      code: captchaCode,
      expires: Date.now() + 1000 * 60 * 5,
    }
    const cookieStore = await cookies()
    const encrypted = await encryptJson(captchaData)
    cookieStore.set('captcha', encrypted, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 5,
      path: '/',
    })
    // 创建SVG验证码图片
    const svg = `
        <svg width="120" height="40" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#f8f9fa;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#e9ecef;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="120" height="40" fill="url(#bg)" rx="4"/>
          <text x="60" y="25" font-family="Arial, sans-serif" font-size="18" 
                text-anchor="middle" fill="#495057" font-weight="bold" 
                style="user-select: none;">${captchaCode}</text>
          <!-- 干扰线 -->
          <line x1="10" y1="8" x2="110" y2="32" stroke="#dee2e6" stroke-width="1" opacity="0.6"/>
          <line x1="10" y1="32" x2="110" y2="8" stroke="#dee2e6" stroke-width="1" opacity="0.6"/>
          <line x1="30" y1="5" x2="90" y2="35" stroke="#ced4da" stroke-width="1" opacity="0.4"/>
          <!-- 干扰点 -->
          <circle cx="20" cy="10" r="1" fill="#adb5bd" opacity="0.6"/>
          <circle cx="100" cy="15" r="1" fill="#adb5bd" opacity="0.6"/>
          <circle cx="15" cy="30" r="1" fill="#adb5bd" opacity="0.6"/>
          <circle cx="95" cy="25" r="1" fill="#adb5bd" opacity="0.6"/>
        </svg>
      `;
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Captcha-Id': captchaId,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate captcha' }, { status: 500 })
  }
}, {
  requireAuth: false
})