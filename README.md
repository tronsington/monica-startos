# monica-startos

A [StartOS](https://start9.com) service package for
[Monica](https://www.monicahq.com) (`monicahq/monica`) — the open-source
personal CRM for organizing your interactions with the people you care
about.

```bash
git clone https://github.com/tronsington/monica-startos
cd monica-startos
npm ci
make x86        # monica_x86_64.s9pk
make arm        # monica_aarch64.s9pk (upstream publishes both)
```

## What this package is

|              |                                                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Upstream pin | `monica:4.1.2-apache@sha256:16f20dcc…` = **v4.1.2**, PHP 8.2.35 rebuild (Docker Official Image, = `latest`, amd64+arm64) |
| Sidecars     | `mariadb:11@sha256:f16d7a34…`                                                                                            |
| Interface    | one web UI + API + `/dav` (CardDAV/CalDAV) on port 80                                                                    |
| Secrets      | `APP_KEY` / `HASH_SALT` / DB passwords — generated at install, never re-rolled                                           |
| Daemons      | mariadb + chown oneshot + app (apache; entrypoint auto-migrates) + queue worker + minute scheduler                       |

Registrations ship **open** so you can create the first account; close them
with the **Registration** action afterward (Monica is single-tenant by
design). Outgoing mail is optional via the **Outgoing Mail** action —
email reminders and signup confirmation mails need it; the rest of the app
does not.

## Repo layout

- `startos/manifest/index.ts` — pins + volumes + RAM floor
- `startos/main.ts` — mariadb sidecar + chown oneshot + app/queue/cron on a shared netns
- `startos/actions/setAppUrl.ts` — the `APP_URL` chooser (critical at install)
- `startos/actions/toggleRegistration.ts` — `APP_DISABLE_SIGNUP` toggle
- `startos/actions/setOutgoingMail.ts` — `MAIL_*` wiring (off by default)
- `startos/backups.ts` — mariadb logical dump + raw volumes
- `UPDATING.md` — pin-bump procedure

## Licenses

- This package: AGPL-3.0 (see `LICENSE`).
- Monica itself: (c) Monica Research & Development Ltd, AGPL-3.0 — see
  upstream's [LICENSE](https://github.com/monicahq/monica/blob/v4.1.2/LICENSE).
