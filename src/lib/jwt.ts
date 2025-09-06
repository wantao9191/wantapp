import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
/**
 * JWT 工具方法集合，封装了基于 `jose` 的访问令牌与刷新令牌的签发与校验。
 *
 * 环境变量（必须/可选）：
 * - JWT_SECRET（必需）：访问令牌签名密钥
 * - JWT_REFRESH_SECRET（可选）：刷新令牌签名密钥；未提供时回退到 JWT_SECRET
 * - JWT_ISSUER（可选）：令牌签发者（iss），默认 `my-fullstack-app`
 * - JWT_AUDIENCE（可选）：令牌受众（aud），默认 `api`
 * - ACCESS_TOKEN_TTL（可选）：访问令牌有效期（秒），默认 1800（30 分钟）
 * - REFRESH_TOKEN_TTL（可选）：刷新令牌有效期（秒），默认 7 天
 */

/** 将字符串密钥编码为 Uint8Array，供 jose 使用 */
const encoder = () => new TextEncoder()

/**
 * 读取环境变量，若不存在则抛出错误（除非提供了 fallback）。
 * @param name 环境变量名
 * @param fallback 备用值（可选）
 * @throws 当既未设置环境变量、也未提供 fallback 时抛出错误
 */
function getEnv(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback
  if (!v) throw new Error(`${name} is not set`)
  return v
}

/**
 * 访问令牌负载。`sub` 为用户唯一标识，`roles`/`permissionsVersion` 供鉴权与权限缓存失效使用。
 */
export type AccessTokenPayload = JWTPayload & {
  id: number
  roles?: string[]
  permissionsVersion?: number
}

/**
 * 签发访问令牌（短期）。
 * - 使用 HS256
 * - 受 `JWT_SECRET`、`JWT_ISSUER`、`JWT_AUDIENCE`、`ACCESS_TOKEN_TTL` 控制
 * @param payload 负载（会合并到标准 JWT 字段之外）
 * @returns 已签名的 JWT 字符串
 */
export async function signAccessToken(payload: AccessTokenPayload) {
  const secret = encoder().encode(getEnv('JWT_SECRET'))
  const issuer = process.env.JWT_ISSUER || 'my-fullstack-app'
  const audience = process.env.JWT_AUDIENCE || 'api'
  const ttlSeconds = Number(process.env.ACCESS_TOKEN_TTL || 1800) // 30分钟

  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuer(issuer)
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .sign(secret)
}

/**
 * 校验访问令牌。
 * - 同时校验签名、签发者（iss）、受众（aud）、过期时间（exp）
 * @param token 待校验的 JWT
 * @returns 解码后的访问令牌负载
 * @throws jose 错误（如过期、签名无效等）
 */
export async function verifyAccessToken(token: string) {
  const secret = encoder().encode(getEnv('JWT_SECRET'))
  const issuer = process.env.JWT_ISSUER || 'my-fullstack-app'
  const audience = process.env.JWT_AUDIENCE || 'api'
  const { payload } = await jwtVerify(token, secret, { issuer, audience })
  return payload as AccessTokenPayload
}

/** 刷新令牌负载。含 `sub`（用户）与 `sid`（会话标识，用于服务端撤销/黑名单）。 */
export type RefreshTokenPayload = JWTPayload & {
  sub: string
  sid: string // session id
}

/**
 * 签发刷新令牌（长期）。
 * - 默认有效期 7 天
 * - 可以与访问令牌使用不同的密钥 `JWT_REFRESH_SECRET`
 * @param payload 刷新令牌负载
 * @returns 已签名的 JWT 字符串
 */
export async function signRefreshToken(payload: RefreshTokenPayload) {
  const secret = encoder().encode(getEnv('JWT_REFRESH_SECRET', process.env.JWT_SECRET))
  const issuer = process.env.JWT_ISSUER || 'my-fullstack-app'
  const audience = process.env.JWT_AUDIENCE || 'api'
  const ttlSeconds = Number(process.env.REFRESH_TOKEN_TTL || 60 * 60 * 24 * 7) // 7d
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuer(issuer)
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .sign(secret)
}

/**
 * 校验刷新令牌。
 * @param token 刷新令牌 JWT
 * @returns 解码后的刷新令牌负载
 * @throws jose 错误（如过期、签名无效等）
 */
export async function verifyRefreshToken(token: string) {
  const secret = encoder().encode(getEnv('JWT_REFRESH_SECRET', process.env.JWT_SECRET))
  const issuer = process.env.JWT_ISSUER || 'my-fullstack-app'
  const audience = process.env.JWT_AUDIENCE || 'api'
  const { payload } = await jwtVerify(token, secret, { issuer, audience })
  return payload as RefreshTokenPayload
}



