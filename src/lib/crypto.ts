import type { VideoManifest } from './types'

export interface EncBlob {
  v: number
  salt: string
  iv: string
  ct: string
}

const b64ToBytes = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0))
const bytesToB64 = (a: Uint8Array) => btoa(String.fromCharCode(...a))

async function deriveKey(
  username: string,
  password: string,
  salt: Uint8Array,
  usage: KeyUsage,
): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(password + ' ' + username.trim().toLowerCase()), 'PBKDF2', false, ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 200000, hash: 'SHA-256' },
    keyMaterial, { name: 'AES-GCM', length: 256 }, false, [usage],
  )
}

// Re-encrypts a manifest with new credentials, producing the same blob format
// the app loads at login. Used by Settings to rotate username/password.
export async function encryptManifest(
  manifest: unknown,
  username: string,
  password: string,
): Promise<EncBlob> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(username, password, salt, 'encrypt')
  const enc = new TextEncoder()
  const ct = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(JSON.stringify(manifest))),
  )
  return { v: 1, salt: bytesToB64(salt), iv: bytesToB64(iv), ct: bytesToB64(ct) }
}

// Mirrors scripts/encrypt-manifest.mjs. Throws if username/password are wrong
// (AES-GCM auth tag fails), which the login flow treats as invalid credentials.
export async function decryptManifest(
  blob: EncBlob,
  username: string,
  password: string,
): Promise<VideoManifest> {
  const key = await deriveKey(username, password, b64ToBytes(blob.salt), 'decrypt')
  const pt = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: b64ToBytes(blob.iv) }, key, b64ToBytes(blob.ct),
  )
  return JSON.parse(new TextDecoder().decode(pt)) as VideoManifest
}

// Triggers a browser download of a JSON blob.
export function downloadJSON(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
