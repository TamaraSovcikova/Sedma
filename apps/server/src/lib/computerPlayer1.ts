import { AutoPlay } from './player';
import { Table } from './table';
import debugLog from 'debug';
const debug = debugLog('computerPlayer1');

export const computerLevel1: AutoPlay = (table: Table, playerIdx: number) => {
  const player = table.players[playerIdx];
  if (playerIdx !== table.currentPlayer) return;
  if (player.onHand.length === 0) {
    table.endRound();
    console.log('computer player', player.name, 'has no cards');
    return;
  }

  const findCard = player.onHand.find(
    (c) => c.face === table.cardToBeat?.face || c.face === 'seven'
  );

  debug(
    `tableId = ${table.id} playerIdx = ${playerIdx} onHand = ${player.onHand}`
  );
  table.playCard(player.id, findCard || player.onHand[0]);
};
