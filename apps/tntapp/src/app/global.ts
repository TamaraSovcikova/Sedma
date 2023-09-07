export const getServerUrl = () => ({
  serverUrl: 'http://localhost:3000/api',
  tableUrl: `ws://localhost:4500`,
  lobbyUrl: (id: string) => `http://localhost:3000/table/lobby/${id}`,
});
