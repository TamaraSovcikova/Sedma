import ws from 'ws';
import { deleteTable, getTable } from './game';
import {
  MessageBase,
  MessageChat,
  MessageError,
  MessageLogin,
  MessagePlayCard,
  MessagePlayerIdx,
} from '@tnt-react/ws-messages';
import debugLog from 'debug';

const debug = debugLog('wsServer'); // Creating a debug logger instance

// Function to handle WebSocket connections
export function handleWs(ws: ws) {
  ws.on('message', (m) => {
    // Event listener for incoming messages
    const message = JSON.parse(m.toString()) as MessageBase;
    debug('messsage recieved:', message);
    processMessage(ws, message); // Processing the received message
  });
  ws.on('close', () => {
    // Event listener for connection closure
    debug('client has disconnected');
  });
}

// Function to process incoming messages
export function processMessage(ws: ws, message: MessageBase) {
  if (message.type === 'login') {
    // Handling login message
    const loginMessage: MessageLogin = message as MessageLogin; // Casting message to login type
    const table = getTable(loginMessage.tableId);
    const player = table
      ? table.players.find((p) => p.id == loginMessage.token) // Finding player in the table
      : null;
    debug('found', table, player);
    if (!table || !player) {
      // If table or player not found
      const m: MessageBase = {
        type: 'loginFailure',
        tableId: loginMessage.tableId,
      };
      ws.send(JSON.stringify(m)); // Sending login failure message
      return;
    }

    player.connectPlayer(ws); // Connecting player to WebSocket
    const playerCount = table.playerCount();
    debug('player count: %d %O', playerCount, table.players);
    if (playerCount < 4) {
      table.waitingForPlayers = true; // Setting table to wait for more players
    } else {
      table.waitingForPlayers = false; // Setting table to not wait for more players
    }

    table.sendUpdates(); // Sending updates to table
  }

  // Handling various message types, all following the same structure as login message...
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
    const allertMessage: MessageBase = {
      type: 'startingGame',
      tableId: table.id,
    };
    table.players.forEach((p) => {
      if (p.autoplay === null && p.name !== '')
        p.ws.send(JSON.stringify(allertMessage));
    });
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

  if (message.type === 'handleLeave') {
    const m: MessagePlayerIdx = message as MessagePlayerIdx;
    const table = getTable(m.tableId);

    const isOwner = table.players[m.playerIdx].id === table.ownerOfTable.id;
    table.playerDisconnect(m.playerIdx);

    if (isOwner) {
      //if the player leaving is the owner, the table gets deleted with him.
      deleteTable(message.tableId);
      return;
    }

    if (table.gameInProgress) {
      const disconnectMessage: MessageBase = {
        type: 'disconnectingPlayer',
        tableId: table.id,
      };
      if (table)
        table.players.forEach((p) => {
          if (p.autoplay === null && p.name !== '')
            p.ws.send(JSON.stringify(disconnectMessage));
        }); //Letting all people know that the owner is leaving and table is terminating
      table.resetGame();
    }
    table.gameInProgress = false;
  }

  if (message.type === 'chatMessage') {
    const chatMessage = message as unknown as MessageChat;
    debug('chat message received:', chatMessage);
    const table = getTable(message.tableId);
    if (table)
      table.players.forEach((p) => {
        if (p.autoplay === null && p.name !== '')
          p.ws.send(JSON.stringify(chatMessage));
      });
  }

  if (message.type === 'playerStay') {
    const m: MessagePlayerIdx = message as MessagePlayerIdx;
    const table = getTable(m.tableId);
    table.players[m.playerIdx].isReadyToPlay = true;
    table.sendUpdates();
  }
}
