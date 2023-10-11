const url = 'http://localhost:3000';

export const getServerUrl = () => ({
  serverUrl: `${url}/api`,
  tableUrl: `ws://localhost:4500`,
  lobbyUrl: (id: string) => `${url}/table/lobby/${id}`,
  newtableUrl: `${url}/table/new`,
  singlePlayerTableUrl: `${url}/table/newSinglePlayer`,
  exitTableUrl: (id: string) => `${url}/table/exists/${id}`,
  checkUsernameUrl: (id: string) => `${url}/table/newUsername/${id}`,
});
