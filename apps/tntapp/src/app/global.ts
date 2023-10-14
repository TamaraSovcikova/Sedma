declare global {
  interface Window {
    serverApi?: string | null;
    serverWs?: string | null;
  }
}

const url = window.serverApi ?? 'http://localhost:3000';

export const getServerUrl = () => ({
  serverUrl: `${url}/api`,
  tableUrl: window.serverWs ?? `ws://localhost:4500`,
  lobbyUrl: (id: string) => `${url}/table/lobby/${id}`,
  newtableUrl: `${url}/table/new`,
  singlePlayerTableUrl: `${url}/table/newSinglePlayer`,
  exitTableUrl: (id: string) => `${url}/table/exists/${id}`,
  checkUsernameUrl: (id: string) => `${url}/table/newUsername/${id}`,
  tabledata: (id: string) => `${url}/table/lobby/data/${id}`,
});
