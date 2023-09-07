import { randomUUID } from 'crypto';
import ws from 'ws';
import { getTable } from './game';
import { Card } from './card';

let wss: ws.Server = null;

interface Client {
  ws: ws.WebSocket;
  playerId: string;
}

interface MessageBase {
  type: 'login' | 'playCard' | 'tableData' | 'loginFailure';
  tableId: string;
}

interface MessageLogin extends MessageBase {
  token: string;
}

export interface TableData {
  players: { name: string; id: string | undefined }[];
  hand: Card[];
  lastPlayedCards: Card[];
}

export interface MessageTableData extends MessageBase {
  data: TableData;
}

const clients: Client[] = [];

export function sendMessageToPlayer(
  playerId: string,
  message: MessageTableData
) {
  const player = clients.find((p) => p.playerId == playerId);
  if (player) player.ws.send(JSON.stringify(message));
  else console.log('player not found:', playerId);
}

export function createWebSocketServer() {
  wss = new ws.Server({ port: 4500 });
  wss.on('connection', (ws) => {
    ws.on('message', (m) => {
      const message = JSON.parse(m.toString()) as MessageBase;
      console.log('messsage recieved:', message);
      if (message.type === 'login') {
        console.log('entered');
        const loginMessage: MessageLogin = message as MessageLogin;
        const table = getTable(loginMessage.tableId);
        const player = table
          ? table.players.find((p) => p.id == loginMessage.token)
          : null;
        console.log('found', table, player);
        if (!table || !player) {
          const m: MessageBase = {
            type: 'loginFailure',
            tableId: loginMessage.tableId,
          };
          ws.send(JSON.stringify(m));
          return;
        }

        const c: Client = { ws, playerId: player.id };
        clients.push(c);
        const players = table.players.map((p) => ({ name: p.name, id: p.id }));
        const lastPlayedCards = table.players.map((p) => p.lastPlayedCard);
        const hand = player.onHand;
        const data: TableData = { players, lastPlayedCards, hand };
        const messageData: MessageTableData = {
          data,
          type: 'tableData',
          tableId: loginMessage.tableId,
        };
        console.log('table data:', data);

        ws.send(JSON.stringify(messageData));
      }
    });
    ws.on('close', () => {
      console.log('client has disconnected');
    });
  });
  console.log('websocket server created :)');
}

function destroyWebSocketServer() {
  wss.close();
}

//TODO: delete player duplicates when linking seats
