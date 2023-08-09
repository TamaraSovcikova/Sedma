export const getServerUrl = () => ({
  serverUrl: 'http://localhost:3000/api',
  tableUrl: (id: string) => `http://localhost:3000/table/${id}`,
  lobbyUrl: (id: string) => `http://localhost:3000/table/lobby/${id}`,
});
