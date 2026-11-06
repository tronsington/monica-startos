# AGENTS.md — monica-startos

StartOS service-package repository for [Monica](https://github.com/monicahq/monica)
(personal CRM), wrapping the Docker **Official Image** `monica` (`apache`
flavor, digest-pinned; README has the pin table) with a `mariadb` sidecar.
**Start every task at the SDK recipe index** — same discipline as siblings.

## Design decisions not to re-litigate

- **APP_URL comes only from the Set App Address action** (critical task at
  install). Monica builds absolute links from it; do not "helpfully" default
  it.
- **APP_KEY is a raw 32-char string**, not `base64:`-prefixed: Laravel's
  AES-256-CBC encrypter takes a plain 32-byte key, and the prefix form would
  need a real 32-byte base64 payload. Never re-roll APP_KEY/HASH_SALT or the
  DB passwords.
- **Migrations are auto-run by the image entrypoint** (only for the apache
  CMD): wait-for-db → `CREATE DATABASE IF NOT EXISTS` → `monica:update
  --force` → passport keys. There is deliberately **no** migrate oneshot.
  Queue/cron bypass that entrypoint path by design.
- **Four daemons**: `db` (mariadb, loopback via `--bind-address=127.0.0.1`),
  `app` (apache :80), `queue` (`queue.sh` = `php artisan queue:work
  --queue=default,migration`), `cron` (`cron.sh` = busybox crond running
  `schedule:run` every minute — fires the reminders). queue/cron run as
  `www-data` (uid 33) so their storage writes match apache's; a
  `chown-storage` oneshot fixes the fresh-volume owner (33:33) because a
  StartOS mount shadows the image's baked-in ownership.
- **QUEUE_CONNECTION=database, CACHE_DRIVER=database** — no redis/memcached
  sidecar; the jobs tables exist at this tag. If upstream ever requires
  redis, revisit.
- store.json lives on `main`, never mounted into daemons.
- Backups = mariadb logical dump (dbdata rebuilt on restore) + raw
  `storage` + raw `main`.

## Known-untested (verify on first real install)

- /login probe across a cold first boot with migrations (grace: 120 s).
- queue/cron behavior during the first-boot migration window (expected:
  brief crash-loop, then settle — same as upstream's own compose).
- CardDAV/CalDAV at /dav with real clients.

## Build gotchas (learned 2026-10-17)
- Fresh clone needs `npm ci` BEFORE `make` — the Makefile includes s9pk.mk
  from node_modules.
- `start-sdk pack` list-ingredients requires an `assets/` dir to exist;
  the repo commits `.gitkeep` for exactly that.

## Daemons must not write to /proc/1/fd (learned 2026-11-06, released as 4.1.2:2)
- The image's `/usr/local/bin/queue.sh` and `cron.sh` redirect output to `/proc/1/fd/{1,2}`.
  StartOS runs those daemons as **www-data** while the pipe behind the container's PID 1 is
  root-owned, so the redirect is refused (`cannot create /proc/1/fd/1: Permission denied`),
  the container exits 2 and crash-loops every ~5 s. It ran like that from 2026-10-22 to
  2026-11-06 — 416 exits — and the queue worker never processed a single job.
- Fix shape: do not call the image's scripts. Run the same commands directly —
  `sh -c 'exec php /var/www/html/artisan queue:work --sleep=10 --timeout=0 --tries=3
  --queue=default,migration'` and `sh -c 'exec busybox crond -f -l 0'` (drop `-L /proc/1/fd/1`).
- `exec.command` is typed `CommandType` = `[string, ...string[]]`; a `string[]` constant fails
  `tsc` with "not assignable to CommandType".
- Proof of a working fix, not a quiet log: job lines ending `DONE` in the package log,
  `pgrep -f queue:work` inside `monica-queue`, and zero `exited with code 2` lines.
