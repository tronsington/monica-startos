import { T } from '@start9labs/start-sdk'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { APP_PORT } from './utils'

// One host, one binding, one interface — apache serves both the UI and the
// API (plus /dav CalDAV/CardDAV) on port 80. (Never add a second binding:
// StartOS auto-disables a public domain on every sibling of the binding
// that gets one.)
export const hostId = 'monica'
export const webInterfaceId = 'web'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const multi = sdk.MultiHost.of(effects, hostId)
  const origin = await multi.bindPort(APP_PORT, {
    protocol: 'http',
    preferredExternalPort: APP_PORT,
  })

  const web = sdk.createInterface(effects, {
    name: i18n('Monica'),
    id: webInterfaceId,
    description: i18n('Monica personal CRM web app'),
    type: 'ui',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })

  return [await origin.export([web])]
})

// Domains + Cloudflare-Tunnel-style plugin hostnames (see the relay
// package's note; same two kinds). Used by the Set App Address action; the
// list never shows an address this interface isn't actually serving.
export function getMonicaAppUrls(effects: T.Effects): Promise<string[]> {
  return sdk.host
    .getOwn(effects, hostId, (host) => {
      const iface =
        host &&
        Object.values(host.bindings)
          .flatMap((b) => Object.values(b.interfaces))
          .find((i) => i.id === webInterfaceId)
      return iface
        ? iface.addressInfo
            .matchesAny([{ kind: 'domain' }, { kind: 'plugin' }])
            .format()
        : []
    })
    .once()
}
