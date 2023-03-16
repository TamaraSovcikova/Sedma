import { Card, Player, Table as TableType } from '../types';
import { ShowCard } from './show-card';
import { ShowPlayer } from './show-player';

interface TableProps {
  table: TableType;
  handOutCard: (player: Player) => void;
  playCard: (player: Player, card: Card) => void;
  currentPlayer: number;
}

export function Table(props: TableProps) {
  const { table, handOutCard, playCard, currentPlayer } = props;
  const lastCard =
    table.discard.length > 0
      ? table.discard[table.discard.length - 1]
      : undefined;
  const players = table.players;

  return (
    <div>
      {players.map((player, index) => (
        <div key={index}>
          <ShowPlayer
            player={player}
            playCard={(i) => playCard(player, i)}
            handOutCard={() => handOutCard(player)}
            current={currentPlayer === index}
          />
        </div>
      ))}
      <div>Last card: {lastCard ? <ShowCard card={lastCard} /> : '-none-'}</div>
    </div>
  );
}
