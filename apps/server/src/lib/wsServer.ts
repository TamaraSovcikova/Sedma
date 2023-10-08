import ws from 'ws';
import { deleteTable, getTable } from './game';
import {
  MessageBase,
  MessageError,
  MessageLogin,
  MessagePlayCard,
  MessagePlayerIdx,
} from '@tnt-react/ws-messages';
import debugLog from 'debug';

const debug = debugLog('wsServer');

let wss: ws.Server = null;

export function createWebSocketServer() {
  wss = new ws.Server({ port: 4500 });
  wss.on('connection', (ws) => {
    ws.on('message', (m) => {
      const message = JSON.parse(m.toString()) as MessageBase;
      debug('messsage recieved:', message);
      if (message.type === 'login') {
        debug('entered');
        const loginMessage: MessageLogin = message as MessageLogin;
        const table = getTable(loginMessage.tableId);
        const player = table
          ? table.players.find((p) => p.id == loginMessage.token)
          : null;
        debug('found', table, player);
        if (!table || !player) {
          const m: MessageBase = {
            type: 'loginFailure',
            tableId: loginMessage.tableId,
          };
          ws.send(JSON.stringify(m));
          return;
        }

        player.connectPlayer(ws);
        const playerCount = table.playerCount();
        debug('player count: %d %O', playerCount, table.players);
        if (playerCount < 4) {
          table.waitingForPlayers = true;
        } else {
          table.waitingForPlayers = false;
        }

        table.sendUpdates();
      }
      if (message.type === 'playCard') {
        const m: MessagePlayCard = message as MessagePlayCard;
        const card = m.card;
        const table = getTable(m.tableId);
        try {
          table.playCard(m.token, card);
          debug('playCard');
        } catch (e) {
          debug(e.message);
          const errorMessage: MessageError = {
            error: e.message,
            type: 'error',
            tableId: m.tableId,
          };
          ws.send(JSON.stringify(errorMessage));
        }
      }
      if (message.type === 'startGame') {
        const table = getTable(message.tableId);
        table.startGame();
      }
      if (message.type === 'endRound') {
        const table = getTable(message.tableId);
        table.endRound();
      }
      if (message.type === 'closeResults') {
        const m: MessagePlayerIdx = message as MessagePlayerIdx;
        const table = getTable(m.tableId);
        table.closeResults(m.playerIdx);
      }
      if (message.type === 'closeEndGameResults') {
        const m: MessagePlayerIdx = message as MessagePlayerIdx;
        const table = getTable(m.tableId);
        table.closeEndGameResults(m.playerIdx);
      }
      if (message.type === 'handleStakesNotReached') {
        const table = getTable(message.tableId);
        table.setUpGame();
      }
      if (message.type === 'handleStakesReached') {
        const table = getTable(message.tableId);
        table.wantContinue();
      }
      if (message.type === 'handleLeave') {
        const m: MessagePlayerIdx = message as MessagePlayerIdx;
        const table = getTable(m.tableId);

        const isOwner = table.players[m.playerIdx].id === table.ownerOfTable.id;
        table.playerDisconnect(m.playerIdx);
        if (isOwner) deleteTable(message.tableId);
      }
    });
    ws.on('close', () => {
      debug('client has disconnected');
    });
  });
  debug('websocket server created :)');
}

function destroyWebSocketServer() {
  wss.close();
}
