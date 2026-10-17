import { storeJson } from './fileModels/store.json'
import { sdk } from './sdk'
import { MARIADB_DATADIR, MYSQL_DATABASE, MYSQL_USER } from './utils'

// Logical mariadb-dump (compressed) over the dbdata volume so restores
// survive MariaDB minor bumps + raw copies of the app storage volume and
// the package's own main volume (the store.json with APP_KEY/HASH_SALT —
// losing them on restore would orphan encrypted fields and sessions).
export const { createBackup, restoreInit } = sdk.setupBackups(async () =>
  sdk.Backups.withMariadbDump({
    imageId: 'mariadb',
    dbVolume: 'dbdata',
    datadir: MARIADB_DATADIR,
    database: MYSQL_DATABASE,
    user: MYSQL_USER,
    password: async () => {
      const password = await storeJson.read((s) => s.dbPassword).once()
      if (!password) throw new Error('No dbPassword found in store.json')
      return password
    },
  })
    .addVolume('storage')
    .addVolume('main'),
)
