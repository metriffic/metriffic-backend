const path = require('path');

module.exports = {
  GQL_HOSTNAME: process.env['METRIFFIC_GQL_HOSTNAME'],
  GQL_PORT: 4000,
  SECRET_KEY : 'secret key',
  AUTH_ALGORITHM: 'RS256',

  //GRID_SERVICE_PUBLIC_KEY_FILE: path.join('keys', 'grid_service_public.key'),
  GRID_SERVICE_PUBLIC_KEY_FILE: process.env['METRIFFIC_GRID_SERVICE_PUBLIC_KEY_FILE'],
  GRID_SERVICE_ENDPOINT: 'grid_service',

  //WORKSPACE_MANAGER_PUBLIC_KEY_FILE: path.join('keys', 'workspace_manager_public.key'),
  WORKSPACE_MANAGER_PUBLIC_KEY_FILE: process.env['METRIFFIC_WORKSPACE_MANAGER_PUBLIC_KEY_FILE'],
  WORKSPACE_MANAGER_ENDPOINT: 'workspace_manager',

  DATABASE_FILE: process.env['METRIFFIC_DB_FILE'],
}
