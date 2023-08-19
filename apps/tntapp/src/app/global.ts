declare global {
  interface Window {
    NX_SERVER_API_URL?: string | null;
  }
}

/**
 * Server API URL.\
 * Specific url is set during installation by modifying file assets/variables.js \
 * Default value is set by the build process using the environment variable NX_API_URL.\
 * If the environment variable is not set, then the default value is 'http://localhost:3000'.
 */
const rootApiUrl = window.NX_SERVER_API_URL ?? process.env['NX_SERVER_API_URL'] ?? 'http://localhost:3000'

export const getServerUrl = () => ({
  serverUrl: `${rootApiUrl}/api`,
  tableUrl: (id: string) => `${rootApiUrl}/table/${id}`,
  lobbyUrl: (id: string) => `${rootApiUrl}/table/lobby/${id}`,
});
