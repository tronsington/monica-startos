import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const shape = z.looseObject({
  // Internal secrets, auto-generated at install (init/seedFiles.ts). Never
  // re-rolled after creation: APP_KEY encrypts stored data and signs
  // sessions (rotation = data loss + logout), HASH_SALT salts contact
  // hashes, and the DB passwords anchor the MariaDB accounts created on
  // first boot.
  dbPassword: z.string().catch(''),
  dbRootPassword: z.string().catch(''),
  // Raw 32-char key (no base64: prefix): exactly the cipher key length
  // Laravel's AES-256-CBC encrypter wants for non-base64 keys.
  appKey: z.string().catch(''),
  hashSalt: z.string().catch(''),
  // The public origin the browser talks to (e.g. https://monica.example.com
  // or http://<box>.local:PORT), chosen via the Set App Address action.
  // Feeds APP_URL — Monica builds absolute links (email reminders, document
  // URLs) from it.
  appUrl: z.string().optional().catch(undefined),
  // Whether brand-new accounts may register (APP_DISABLE_SIGNUP, inverted).
  // Ships true at install so the FIRST account can be created; Monica
  // single-tenant style means you close it right after (Toggle
  // Registration action).
  signupsEnabled: z.boolean().catch(true),

  // Outgoing mail (set via Set Outgoing Mail). All empty = mail off
  // (MAIL_MAILER=log, nothing leaves the box). Needed for email reminders
  // and double-opt-in confirmations.
  mailHost: z.string().catch(''),
  mailPort: z.string().catch('587'),
  mailUsername: z.string().catch(''),
  mailPassword: z.string().catch(''),
  // '' (none) | 'tls' | 'ssl'
  mailEncryption: z.string().catch(''),
  mailFromAddress: z.string().catch(''),
  mailFromName: z.string().catch(''),
})

export const storeJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: 'store.json' },
  shape,
)
