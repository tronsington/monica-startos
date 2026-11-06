import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '4.1.2:2',
  releaseNotes: {
    en_US:
      "Fixes the queue worker and scheduler crash loop that 4.1.2:1 hit on install: both now run without the image's log redirect, which is refused under the daemon user. Same Monica v4.1.2 and the same PHP 8.2.35 security rebuild as :1. No data change — installs in place over :1.",
    es_ES:
      'Corrige el bucle de fallos del worker de cola y del planificador que aparecía al instalar 4.1.2:1: ambos se ejecutan ahora sin la redirección de registro de la imagen, que se rechaza con el usuario de los demonios. Mismo Monica v4.1.2 y misma recompilación de seguridad PHP 8.2.35 que :1. Sin cambios en los datos — se instala sobre :1.',
    de_DE:
      'Behebt die Absturzschleife von Queue-Worker und Scheduler, die bei der Installation von 4.1.2:1 auftrat: Beide laufen jetzt ohne die Log-Umleitung des Images, die unter dem Daemon-Benutzer abgelehnt wird. Gleiches Monica v4.1.2 und gleicher PHP-8.2.35-Sicherheits-Rebuild wie :1. Keine Datenänderung — installiert sich über :1.',
    pl_PL:
      'Naprawia pętlę awarii procesu kolejki i harmonogramu, która wystąpiła przy instalacji 4.1.2:1: oba działają teraz bez przekierowania logów z obrazu, które jest odrzucane na użytkowniku demonów. Ten sam Monica v4.1.2 i ta sama przebudowa bezpieczeństwa PHP 8.2.35 co :1. Bez zmian w danych — instaluje się na :1.',
    fr_FR:
      "Corrige la boucle de plantage du worker de file et du planificateur apparue à l'installation de 4.1.2:1 : les deux tournent désormais sans la redirection de journal de l'image, refusée sous l'utilisateur des démons. Même Monica v4.1.2 et même reconstruction de sécurité PHP 8.2.35 que :1. Aucun changement de données — s'installe par-dessus :1.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
