import ws from 'ws';
import { getTable } from './game';
import { Card } from './card';
import debugLog from 'debug';
import { NumberLiteralType } from 'typescript';

const debug = debugLog('wsServer');

let wss: ws.Server = null;

interface MessageBase {
  type:
    | 'login'
    | 'playCard'
    | 'tableData'
    | 'loginFailure'
    | 'error'
    | 'startGame'
    | 'endRound'
    | 'closeResults'
    | 'closeEndGameResults'
    | 'handleStakesNotReached'
    | 'handleStakesReached';
  tableId: string;
}

interface MessageLogin extends MessageBase {
  token: string;
}

interface MessagePlayCard extends MessageBase {
  card: Card;
  token?: string;
}
export interface MessagePlayerIdx extends MessageBase {
  playerIdx: number;
}

export interface TableData {
  players: { name: string; id: string | undefined }[];
  hand: Card[];
  lastPlayedCards: Card[];
  waitingForPlayers: boolean;
  currentPlayer: number;
  ownerOfTableId: string;
  gameInProgress: boolean;
  winningPlayerId: string;
  leadPlayerId: string;
  round: number;
  cardToBeat: Card;
  teamWonRound: string;
  wonPoints: number;
  showresults: boolean;
  gameEnd: boolean;
  teamAPoints: number;
  teamBPoints: number;
  teamAStakeCount: number;
  teamBStakeCount: number;
  finalStakeCount: number;
  askContinue: boolean;
  stakesReached: boolean;
  playAgain: boolean;
  isFirstDeal: number;
}

export interface MessageTableData extends MessageBase {
  data: TableData;
}

export interface MessageError extends MessageBase {
  error: string;
}

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
