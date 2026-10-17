export const APP_PORT = 80 // apache inside the monica image
export const MYSQL_DATABASE = 'monica'
export const MYSQL_USER = 'monica'
// Upstream's Laravel root inside the image; storage holds uploads, avatars,
// passport oauth keys and generated assets, and is shared by app/queue/cron.
export const STORAGE_PATH = '/var/www/html/storage'
export const MARIADB_DATADIR = '/var/lib/mysql'
// www-data inside the php:8.2-apache flavor (debian uid/gid 33). The app
// entrypoint chowns storage to this user; queue/cron run as it too so
// job-written files match apache's ownership.
export const WWW_DATA_UID = '33'
