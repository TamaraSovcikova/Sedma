import { randomUUID } from 'crypto';
import ws from 'ws';

let wss: ws.Server = null;

interface Client {
  ws: ws.WebSocket;
  playerId: string;
}

const clients: Client[] = [];

export function createWebSocketServer() {
  wss = new ws.Server({ port: 4500 });
  wss.on('connection', (ws) => {
    const c: Client = { ws, playerId: randomUUID() };
    ws.on('message', (message) => {
      console.log(message.toString());
    });
    clients.push(c);
    ws.on('close', () => {
      console.log('client has disconnected with ID: ', c.playerId);
    });
  });
  console.log('websocket server created :)');
}

function destroyWebSocketServer() {
  wss.close();
}
