// Extend the Window interface to include custom properties for server URLs
declare global {
  interface Window {
    serverApi?: string | null;
    serverWs?: string | null;
  }
}

// Define default server URLs if not provided by the Window object
const url = window.serverApi ?? 'http://localhost:3000';
const wsUrl = window.serverWs ?? 'ws://localhost:3000';

// Configuration for client-side server URLs
export const getServerUrl = () => ({
  serverUrl: `${url}/api`,
  tableUrl: wsUrl,
  lobbyUrl: (id: string) => `${url}/table/lobby/${id}`,
  newtableUrl: `${url}/table/new`,
  singlePlayerTableUrl: `${url}/table/newSinglePlayer`,
  checkIfTableExistsUrl: (id: string) => `${url}/table/exists/${id}`,
  checkUsernameUrl: (id: string) => `${url}/table/newUsername/${id}`,
  tabledata: (id: string) => `${url}/table/lobby/data/${id}`,
  deletePlayerUrl: (id: string) => `${url}/table/deletePlayer/${id}`,
  playerLogOutUrl: (id: string) => `${url}/table/loggout/${id}`,
  leavingLobby: (id: string) => `${url}/table/delete/${id}`,
});
