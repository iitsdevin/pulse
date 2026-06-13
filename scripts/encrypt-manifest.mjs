// Encrypts the private video manifest with a username + password so the file IDs
// are not exposed on the public site. Run:  PULSE_USER=you PULSE_PASS=secret npm run encrypt
import { webcrypto as crypto } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'

const username = (process.env.PULSE_USER || '').trim()
const password = process.env.PULSE_PASS || ''
if (!username || !password) {
  console.error('Set both PULSE_USER and PULSE_PASS, e.g.:')
  console.error("  PULSE_USER=devin PULSE_PASS='your-password' npm run encrypt")
  process.exit(1)
}

const SRC = new URL('./private/video-manifest.source.json', 'file://' + process.cwd() + '/')
const OUT = new URL('./public/video-manifest.enc.json', 'file://' + process.cwd() + '/')

const source = JSON.parse(readFileSync(SRC))
const enc = new TextEncoder()
const b64 = (a) => Buffer.from(a).toString('base64')
const unb64 = (s) => Uint8Array.from(Buffer.from(s, 'base64'))

const keyStr = password + ' ' + username.toLowerCase()
const salt = crypto.getRandomValues(new Uint8Array(16))
const iv = crypto.getRandomValues(new Uint8Array(12))

const km = await crypto.subtle.importKey('raw', enc.encode(keyStr), 'PBKDF2', false, ['deriveKey'])
const key = await crypto.subtle.deriveKey(
  { name: 'PBKDF2', salt, iterations: 200000, hash: 'SHA-256' },
  km, { name: 'AES-GCM', length: 256 }, false, ['encrypt'],
)
const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(JSON.stringify(source))))

writeFileSync(OUT, JSON.stringify({ v: 1, salt: b64(salt), iv: b64(iv), ct: b64(ct) }))

// self-verify the file round-trips before declaring success
const blob = JSON.parse(readFileSync(OUT))
const km2 = await crypto.subtle.importKey('raw', enc.encode(keyStr), 'PBKDF2', false, ['deriveKey'])
const dk = await crypto.subtle.deriveKey(
  { name: 'PBKDF2', salt: unb64(blob.salt), iterations: 200000, hash: 'SHA-256' },
  km2, { name: 'AES-GCM', length: 256 }, false, ['decrypt'],
)
await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(blob.iv) }, dk, unb64(blob.ct))

console.log(`Encrypted + verified ${Object.keys(source.workouts).length} workout + ${Object.keys(source.demos).length} demo links for user "${username}".`)
