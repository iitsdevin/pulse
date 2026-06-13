import type { VideoManifest } from './types'

export interface EncBlob {
  v: number
  salt: string
  iv: string
  ct: string
}

const b64ToBytes = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0))

// Mirrors scripts/encrypt-manifest.mjs. Throws if username/password are wrong
// (AES-GCM auth tag fails), which the login flow treats as invalid credentials.
export async function decryptManifest(
  blob: EncBlob,
  username: string,
  password: string,
): Promise<VideoManifest> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(password + ' ' + username.trim().toLowerCase()), 'PBKDF2', false, ['deriveKey'],
  )
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: b64ToBytes(blob.salt), iterations: 200000, hash: 'SHA-256' },
    keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['decrypt'],
  )
  const pt = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: b64ToBytes(blob.iv) }, key, b64ToBytes(blob.ct),
  )
  return JSON.parse(new TextDecoder().decode(pt)) as VideoManifest
}
