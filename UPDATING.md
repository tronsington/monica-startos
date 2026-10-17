# Updating the upstream version

Upstream (`monicahq/monica`) releases as `vX.Y.Z` tags; runnable images land
on Docker Hub as the **Docker Official Image** `monica`
(hub.docker.com/_/monica), maintained by docker-library from
`monicahq/docker`. Do **not** pin anything from the `monicahq/*` Hub org —
those images are stale (2020). This package pins by **digest**.

A bump is:

1. Pick the upstream release (https://github.com/monicahq/monica/releases).
   Skip beta lines (e.g. 5.0.0-beta.*) unless deliberately packaging one.
2. Resolve the digest:
   `docker buildx imagetools inspect monica:X.Y.Z-apache` — top-level
   `Digest:`, and confirm amd64+arm64 children are both present.
   **Check the tag's `last_updated` freshness, not just the version
   number** — the library rebuilds weekly; compare against Hub's `latest`:
   if `latest` moved on, the bare tag is stale. Also confirm the image
   label `org.opencontainers.image.revision` equals the release commit.
3. Re-read upstream's `.env.example` and
   https://github.com/monicahq/docker (`4/apache/` entrypoint.sh, queue.sh,
   cron.sh) **at the pinned tag/version** for new or renamed env vars or
   changed script names before touching `startos/main.ts` — the env surface
   and the entrypoint contract drift between majors.
4. Re-check: does the entrypoint still auto-run `monica:update` for the
   apache CMD? Do jobs/failed_jobs tables still back the `database` queue
   driver? Any new required sidecar (redis)?
5. Update `dockerTag` in `startos/manifest/index.ts`, the pin table in
   `README.md`, and `version` in `startos/versions/current.ts` (`X.Y.Z:0`).
6. Release notes: 5 locales.
7. Build + install on the test box. First boot after a real upgrade runs
   pending migrations via the app entrypoint — watch health before
   declaring done.
