import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'monica',
  title: 'Monica',
  license: 'AGPL-3.0', // matches upstream monicahq/monica
  packageRepo: 'https://github.com/tronsington/monica-startos',
  upstreamRepo: 'https://github.com/monicahq/monica',
  marketingUrl: 'https://www.monicahq.com',
  donationUrl: null,
  description: { short, long },
  // storage = Monica's /var/www/html/storage (uploads, avatars, generated
  // assets, passport oauth keys) shared by app/queue/cron; dbdata = MariaDB
  // data directory; main = this package's own store.json. Do not co-locate.
  volumes: ['storage', 'dbdata', 'main'],
  images: {
    // Docker Official Image `monica` (built by docker-library from
    // monicahq/docker) — NOT the stale monicahq/* Hub org (last push 2020).
    // v4.1.2-apache, pinned by index digest. 2026-10-22 re-pin onto the
    // PHP 8.2.35 security rebuild (GHSA-w8hw-w9fx-j79w, GHSA-6wmf-4rv5-p3rp);
    // the previous 787c7e99… pin carried PHP 8.2.34. amd64+arm64 both
    // verified to run 8.2.35 at the same upstream v4.1.2 revision.
    monica: {
      source: {
        dockerTag:
          'monica:4.1.2-apache@sha256:16f20dcc0e8ed8d21fcd0f72358751c2603feea25ed1772aea9d5c9869b341e3',
      },
      arch: ['x86_64', 'aarch64'],
    },
    // mariadb:11, Hub's current :11 index digest (resolved 2026-10-17 —
    // the same tag upstream's own compose example pins). amd64+arm64.
    mariadb: {
      source: {
        dockerTag:
          'mariadb:11@sha256:f16d7a344413e519dff518f27bdb221388f84b0d274c97c4fb5f2cb0dc1b34fa',
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
  // PHP/apache app + queue worker + cron + internal MariaDB. 1 GiB mirrors
  // upstream's modest footprint (no Node/webpack giant here).
  hardwareRequirements: {
    ram: 1024 ** 3,
  },
})
