import { Buffer } from 'node:buffer'

function getEnv(name: string): string {
	const value = process.env[name]
	if (!value) throw new Error(`${name} is not set`)
	return value
}

function base64UrlEncode(data: Uint8Array): string {
	const b64 = Buffer.from(data).toString('base64')
	return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function base64UrlDecode(input: string): Uint8Array {
	let b64 = input.replace(/-/g, '+').replace(/_/g, '/')
	const padding = 4 - (b64.length % 4 || 4)
	if (padding !== 4) b64 = b64 + '='.repeat(padding)
	return new Uint8Array(Buffer.from(b64, 'base64'))
}

async function getAesGcmKey(): Promise<CryptoKey> {
	const keyB64 = getEnv('DATA_ENCRYPTION_KEY')
	const keyBytes = base64UrlDecode(keyB64)
	if (![16, 24, 32].includes(keyBytes.length)) {
		throw new Error('DATA_ENCRYPTION_KEY must be 16/24/32 bytes (base64url-encoded)')
	}
	const keyCopy = new Uint8Array(keyBytes.length)
	keyCopy.set(keyBytes)
	return crypto.subtle.importKey('raw', keyCopy, { name: 'AES-GCM', length: keyCopy.length * 8 }, false, ['encrypt', 'decrypt'])
}

export async function encryptString(plainText: string): Promise<string> {
	const key = await getAesGcmKey()
	const iv = crypto.getRandomValues(new Uint8Array(12))
	const encoded = new TextEncoder().encode(plainText)
	const cipherBuffer = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded)
	const cipherBytes = new Uint8Array(cipherBuffer)
	const result = new Uint8Array(iv.length + cipherBytes.length)
	result.set(iv, 0)
	result.set(cipherBytes, iv.length)
	return base64UrlEncode(result)
}

export async function decryptString(token: string): Promise<string> {
	const key = await getAesGcmKey()
	const combined = base64UrlDecode(token)
	if (combined.length < 13) throw new Error('Invalid token')
	const iv = combined.slice(0, 12)
	const cipherBytes = combined.slice(12)
	const plainBuffer = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipherBytes)
	return new TextDecoder().decode(new Uint8Array(plainBuffer))
}

export async function encryptJson<T extends object>(value: T): Promise<string> {
	return encryptString(JSON.stringify(value))
}

export async function decryptJson<T = any>(token: string): Promise<T> {
	const json = await decryptString(token)
	return JSON.parse(json) as T
}


