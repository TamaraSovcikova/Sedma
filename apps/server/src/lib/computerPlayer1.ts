import { AutoPlay } from './player';
import { Table } from './table';
import debugLog from 'debug';

const debug = debugLog('computerPlayer1');

export const computerLevel1: AutoPlay = (table: Table, playerIdx: number) => {
  const player = table.players[playerIdx];

  // Check if it is the bots turn to play
  if (playerIdx !== table.currentPlayer) return;

  // Check if the bot has no cards left
  if (player.onHand.length === 0) {
    table.endRound();
    console.log('Computer player', player.name, 'has no cards');
    return;
  }

  // Check if bot has a card to beat the current winning player
  const findCard = player.onHand.find(
    (c) => c.face === table.cardToBeat?.face || c.face === 'seven'
  );

  // Play the selected card or the first card in hand if no match is found
  table.playCard(player.id, findCard || player.onHand[0]);
};
