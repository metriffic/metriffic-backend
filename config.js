const path = require('path');

module.exports = {
  HOSTNAME: 'localhost',
  PORT: 4000,
  SECRET_KEY : 'secret key',
  AUTH_ALGORITHM: 'RS256',

  GRID_SERVICE_PUBLIC_KEY_FILE: path.join('keys', 'grid_service_public.key'),
  GRID_SERVICE_ENDPOINT: 'grid_service',

  WORKSPACE_MANAGER_PUBLIC_KEY_FILE: path.join('keys', 'workspace_manager_public.key'),
  WORKSPACE_MANAGER_ENDPOINT: 'workspace_manager'
}
