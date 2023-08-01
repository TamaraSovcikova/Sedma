import React from 'react';
import { Card, Player, Table as TableType } from '../types';
import { ShowCard } from './show-card';
import { ShowPlayer } from './show-player';

interface Props {
  table: TableType;
  onPlayCard: (player: Player, card: Card) => void;
  onTakeCard: (player: Player) => void;
  currentPlayer: number;
}

function Table({ table, onTakeCard, onPlayCard, currentPlayer }: Props) {
  const players = table.players;
  const lastCard =
    table.discard.length > 0
      ? table.discard[table.discard.length - 1]
      : undefined;

  return (
    <div>
      {players.map((player, index) => (
        <div key={index}>
          <ShowPlayer
            player={player}
            playCard={(card) => onPlayCard(player, card)}
            takeCard={() => onTakeCard(player)}
            current={currentPlayer === index}
          />
        </div>
      ))}
      <div>
        Last card:{' '}
        {lastCard ? <ShowCard card={lastCard} size={'small'} /> : '-none-'}
      </div>
    </div>
  );
}

export default Table;
