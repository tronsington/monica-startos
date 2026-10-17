import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '4.1.2:0',
  releaseNotes: {
    en_US:
      'Initial StartOS package of Monica v4.1.2 (Docker Official Image, digest-pinned). Runs the web app plus internal MariaDB, a queue worker and the reminder scheduler; choose the app address during install, register your account, then close registration.',
    es_ES:
      'Paquete inicial para StartOS de Monica v4.1.2 (imagen oficial de Docker, fijada por digest). Ejecuta la app web junto a MariaDB interno, un worker de cola y el planificador de recordatorios; elige la dirección de la app durante la instalación, registra tu cuenta y luego cierra el registro.',
    de_DE:
      'Erstes StartOS-Paket für Monica v4.1.2 (Docker Official Image, per Digest angepinnt). Startet die Web-App sowie internes MariaDB, einen Queue-Worker und den Erinnerungsplaner; bei der Installation die App-Adresse wählen, dein Konto registrieren und danach die Registrierung schließen.',
    pl_PL:
      'Pierwszy pakiet StartOS dla Monica v4.1.2 (oficjalny obraz Dockera, przypięty po digeście). Uruchamia aplikację webową oraz wewnętrzne MariaDB, workera kolejki i planistę przypomnień; przy instalacji wybierz adres aplikacji, zarejestruj konto i zamknij rejestrację.',
    fr_FR:
      "Premier paquet StartOS pour Monica v4.1.2 (image Docker officielle, épinglée par digest). Lance l'app web ainsi que MariaDB interne, un worker de file et le planificateur de rappels ; à l'installation, choisissez l'adresse de l'app, créez votre compte puis fermez les inscriptions.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
