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
    // v4.1.2-apache, pinned by index digest; verified amd64+arm64 on
    // 2026-10-17: digest == `latest` == `4.1.2` tags, same-day rebuild, and
    // the image's org.opencontainers.image.revision label == v4.1.2 commit.
    monica: {
      source: {
        dockerTag:
          'monica:4.1.2-apache@sha256:787c7e9972cad3956f378afd93e0ac140863dba9199f81f6b368a65a96b32e54',
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
