import { utils } from '@start9labs/start-sdk'
import { setAppUrl } from '../actions/setAppUrl'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const seedFiles = sdk.setupOnInit(async (effects, kind) => {
  if (kind !== 'install') return

  await storeJson.merge(effects, {
    dbPassword: utils.getDefaultString({ charset: 'a-z,A-Z,0-9', len: 22 }),
    dbRootPassword: utils.getDefaultString({
      charset: 'a-z,A-Z,0-9',
      len: 22,
    }),
    // Raw 32 chars — Laravel accepts a plain 32-byte string as an
    // AES-256-CBC key (no base64: prefix needed).
    appKey: utils.getDefaultString({ charset: 'a-z,A-Z,0-9', len: 32 }),
    hashSalt: utils.getDefaultString({ charset: 'a-z,A-Z,0-9', len: 24 }),
    signupsEnabled: true,
  })

  // Head of the setup chain: APP_URL feeds absolute link generation, so the
  // service cannot start meaningfully before this is answered.
  await sdk.action.createOwnTask(effects, setAppUrl, 'critical', {
    reason: i18n('Choose the address Monica serves its web app on'),
  })
})
