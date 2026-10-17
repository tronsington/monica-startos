import { i18n } from './i18n'
import { sdk } from './sdk'
import { storeJson } from './fileModels/store.json'
import {
  APP_PORT,
  MARIADB_DATADIR,
  MYSQL_DATABASE,
  MYSQL_USER,
  STORAGE_PATH,
  WWW_DATA_UID,
} from './utils'

// The app image's own long-running scripts (installed to /usr/local/bin by
// monicahq/docker; verified at main + baked into the pinned image):
const QUEUE_CMD = 'queue.sh' // php artisan queue:work --sleep=10 --timeout=0
//                             --tries=3 --queue=default,migration
const CRON_CMD = 'cron.sh' // busybox crond -f → every-minute `schedule:run`

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Monica'))

  // Mapped read: only the fields feeding daemon env, so any unrelated store
  // change never bounces the daemon graph (relay package precedent).
  const store = await storeJson
    .read((s) => ({
      dbPassword: s.dbPassword,
      dbRootPassword: s.dbRootPassword,
      appKey: s.appKey,
      hashSalt: s.hashSalt,
      appUrl: s.appUrl,
      signupsEnabled: s.signupsEnabled,
      mailHost: s.mailHost,
      mailPort: s.mailPort,
      mailUsername: s.mailUsername,
      mailPassword: s.mailPassword,
      mailEncryption: s.mailEncryption,
      mailFromAddress: s.mailFromAddress,
      mailFromName: s.mailFromName,
    }))
    .const(effects)

  const dbPassword = store?.dbPassword ?? ''
  const appUrl = store?.appUrl ?? ''
  const signupsEnabled = store?.signupsEnabled ?? true

  // Outgoing mail: host set → full smtp wiring; unset → MAIL_MAILER=log so
  // reminder mails degrade to log lines instead of SMTP errors.
  const mailHost = store?.mailHost ?? ''
  const mailEnv = mailHost
    ? {
        MAIL_MAILER: 'smtp',
        MAIL_HOST: mailHost,
        MAIL_PORT: store?.mailPort || '587',
        MAIL_USERNAME: store?.mailUsername ?? '',
        MAIL_PASSWORD: store?.mailPassword ?? '',
        MAIL_ENCRYPTION: store?.mailEncryption ?? '',
        MAIL_FROM_ADDRESS: store?.mailFromAddress ?? '',
        MAIL_FROM_NAME: store?.mailFromName || 'Monica instance',
      }
    : { MAIL_MAILER: 'log' }

  // One env block for all three monica-image daemons, matching upstream's
  // compose (app/queue/cron share env_file). Names verified against
  // .env.example at v4.1.2. Queue/cron need the same APP_KEY/HASH_SALT/DB_*
  // wiring: queued jobs decrypt and write through the same code path.
  const appEnv = {
    APP_ENV: 'production',
    APP_DEBUG: 'false',
    APP_URL: appUrl,
    // Any proxy in front is trusted: StartOS terminates TLS at its
    // interface layer (caddy), and Monica generates https URLs from APP_URL.
    APP_TRUSTED_PROXIES: '*',
    APP_KEY: store?.appKey ?? '',
    HASH_SALT: store?.hashSalt ?? '',
    DB_CONNECTION: 'mysql',
    DB_HOST: '127.0.0.1',
    DB_PORT: '3306',
    DB_DATABASE: MYSQL_DATABASE,
    DB_USERNAME: MYSQL_USER,
    DB_PASSWORD: dbPassword,
    DB_USE_UTF8MB4: 'true',
    // Database queue driver — no redis/memcached needed (jobs/failed_jobs
    // tables exist in 4.x; verified at the pinned tag). This is what the
    // queue daemon consumes.
    QUEUE_CONNECTION: 'database',
    CACHE_DRIVER: 'database',
    SESSION_DRIVER: 'file',
    LOG_CHANNEL: 'stderr',
    CHECK_VERSION: 'false',
    APP_DISABLE_SIGNUP: signupsEnabled ? 'false' : 'true',
    ...mailEnv,
  }

  /**
   * ======================== MariaDB sidecar ========================
   * Dedicated to this package; loopback only. mariadb:11 digest-pinned in
   * the manifest to the same tag upstream's compose example pins; the
   * image entrypoint self-initializes and self-chowns the datadir.
   */
  const mariadbSub = sdk.SubContainer.of(
    effects,
    { imageId: 'mariadb' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'dbdata',
      subpath: null,
      mountpoint: MARIADB_DATADIR,
      readonly: false,
    }),
    'mariadb',
  )

  /**
   * ======================== Monica app image subcontainers ========================
   * app / queue / cron all run from the one image against the shared storage
   * volume (upstream's full compose split).
   */
  const appSub = sdk.SubContainer.of(
    effects,
    { imageId: 'monica' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'storage',
      subpath: null,
      mountpoint: STORAGE_PATH,
      readonly: false,
    }),
    'monica-app',
  )
  const queueSub = sdk.SubContainer.of(
    effects,
    { imageId: 'monica' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'storage',
      subpath: null,
      mountpoint: STORAGE_PATH,
      readonly: false,
    }),
    'monica-queue',
  )
  const cronSub = sdk.SubContainer.of(
    effects,
    { imageId: 'monica' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'storage',
      subpath: null,
      mountpoint: STORAGE_PATH,
      readonly: false,
    }),
    'monica-cron',
  )
  // Debian-based image — has coreutils chown. (Outline package used the app
  // image the same way when no busybox sidecar was in the pin set.)
  const chownSub = sdk.SubContainer.of(
    effects,
    { imageId: 'monica' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'storage',
      subpath: null,
      mountpoint: STORAGE_PATH,
      readonly: false,
    }),
    'chown-storage',
  )

  return (
    sdk.Daemons.of(effects)
      // A fresh StartOS volume mounts root-owned and shadows whatever the
      // image baked in. The app entrypoint re-chowns on every boot, but
      // queue/cron bypass that path in the image entrypoint — so the
      // oneshot guarantees www-data ownership before any daemon touches
      // the volume (rakazo/outline precedent).
      .addOneshot('chown-storage', {
        subcontainer: chownSub,
        exec: {
          command: [
            'chown',
            '-R',
            `${WWW_DATA_UID}:${WWW_DATA_UID}`,
            STORAGE_PATH,
          ],
          user: 'root',
        },
        requires: [],
      })
      .addDaemon('db', {
        subcontainer: mariadbSub,
        exec: {
          command: sdk.useEntrypoint(['--bind-address=127.0.0.1']),
          env: {
            MYSQL_DATABASE,
            MYSQL_USER,
            MYSQL_PASSWORD: dbPassword,
            MYSQL_ROOT_PASSWORD: store?.dbRootPassword ?? '',
          },
        },
        ready: {
          display: null, // internal sidecar
          fn: async () => {
            const result = await mariadbSub.exec([
              'mariadb-admin',
              'status',
              '-h',
              '127.0.0.1',
              '-u',
              MYSQL_USER,
              `-p${dbPassword}`,
              '--silent',
            ])
            return result.exitCode === 0
              ? { result: 'success', message: i18n('MariaDB is ready') }
              : {
                  result: 'starting',
                  message: i18n('Waiting for MariaDB to be ready'),
                }
          },
          gracePeriod: 30_000,
        },
        requires: [],
      })
      .addDaemon('app', {
        subcontainer: appSub,
        exec: {
          // Image default (apache2-foreground): the entrypoint waits for
          // the DB, creates it if missing, runs `monica:update` migrations
          // and passport-key setup, then serves on port 80.
          command: sdk.useEntrypoint(),
          env: appEnv,
        },
        ready: {
          display: i18n('Monica'),
          fn: () =>
            sdk.healthCheck.checkWebUrl(
              effects,
              `http://127.0.0.1:${APP_PORT}/login`,
              {
                successMessage: i18n('Monica is ready'),
                errorMessage: i18n('Monica is not ready'),
              },
            ),
          // First boot runs the full Laravel migration set before apache
          // starts serving; the twenty package precedent keeps this window
          // at 120 s, and if migrations outrun it the health tick flips
          // green as soon as apache actually comes up.
          gracePeriod: 120_000,
        },
        requires: ['db', 'chown-storage'],
      })
      // Reminder/notification jobs (database queue driver). Same env as the
      // app; runs as www-data so job writes match apache's ownership. If it
      // ever lands before the app's first-boot migrations finish it exits
      // and restarts — the same ordering upstream's own compose accepts.
      .addDaemon('queue', {
        subcontainer: queueSub,
        exec: {
          command: sdk.useEntrypoint([QUEUE_CMD]),
          user: 'www-data',
          env: appEnv,
        },
        ready: {
          display: null, // internal worker, no port of its own
          fn: async () => {
            const result = await queueSub.exec(['pgrep', '-f', 'queue:work'])
            return result.exitCode === 0
              ? { result: 'success', message: i18n('Queue worker is running') }
              : {
                  result: 'failure',
                  message: i18n('Queue worker is not running'),
                }
          },
          gracePeriod: 30_000,
        },
        requires: ['app', 'chown-storage'],
      })
      // The every-minute Laravel scheduler — this is what fires timed
      // reminders. Nothing works around it; upstream bakes the crontab.
      .addDaemon('cron', {
        subcontainer: cronSub,
        exec: {
          command: sdk.useEntrypoint([CRON_CMD]),
          user: 'www-data',
          env: appEnv,
        },
        ready: {
          display: null,
          fn: async () => {
            const result = await cronSub.exec(['pgrep', '-f', 'crond'])
            return result.exitCode === 0
              ? { result: 'success', message: i18n('Scheduler is running') }
              : { result: 'failure', message: i18n('Scheduler is not running') }
          },
          gracePeriod: 30_000,
        },
        requires: ['app', 'chown-storage'],
      })
  )
})
