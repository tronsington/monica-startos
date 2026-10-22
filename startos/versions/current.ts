import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '4.1.2:1',
  releaseNotes: {
    en_US:
      'PHP 8.2.35 security rebuild (GHSA-w8hw-w9fx-j79w, GHSA-6wmf-4rv5-p3rp). Same Monica v4.1.2, same data layout — installs as an update in place.',
    es_ES:
      'Recompilación de seguridad de PHP 8.2.35 (GHSA-w8hw-w9fx-j79w, GHSA-6wmf-4rv5-p3rp). Mismo Monica v4.1.2, mismos datos — se instala como actualización sobre la marcha.',
    de_DE:
      'PHP-8.2.35-Sicherheits-Rebuild (GHSA-w8hw-w9fx-j79w, GHSA-6wmf-4rv5-p3rp). Gleiches Monica v4.1.2, gleiches Datenlayout — installiert sich als Update in place.',
    pl_PL:
      'Przebudowa bezpieczeństwa PHP 8.2.35 (GHSA-w8hw-w9fx-j79w, GHSA-6wmf-4rv5-p3rp). Ten sam Monica v4.1.2, ten sam układ danych — instaluje się jako aktualizacja w miejscu.',
    fr_FR:
      "Reconstruction de sécurité PHP 8.2.35 (GHSA-w8hw-w9fx-j79w, GHSA-6wmf-4rv5-p3rp). Même Monica v4.1.2, même disposition des données — s'installe en mise à jour sur place.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
