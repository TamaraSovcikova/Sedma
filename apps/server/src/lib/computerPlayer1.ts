import { AutoPlay } from './player';
import { Table } from './table';
import debugLog from 'debug';
const debug = debugLog('computerPlayer1');

export const computerLevel1: AutoPlay = (table: Table, playerIdx: number) => {
  if (playerIdx !== table.currentPlayer) return;
  const player = table.players[playerIdx];
  if (player.onHand.length === 0) return;

  const findCard = player.onHand.find((c) => {
    c.face === table.cardToBeat.face;
  });

  if (findCard) table.playCard(player.id, findCard);
  else {
    debug(
      'tableId = %s playerIdx= %d onHand = %o',
      table.id,
      playerIdx,
      player.onHand
    );
    table.playCard(player.id, player.onHand[0]);
  }
};
