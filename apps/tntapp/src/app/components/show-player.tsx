import { Card, Player } from '../types';
import { ShowCard } from './show-card';

interface ShowPlayerProps {
  player: Player;
  playCard: (card: Card) => void;
  takeCard: () => void;
}

export function ShowPlayer(props: ShowPlayerProps) {
  const { player, playCard, takeCard } = props;
  return (
    <div>
      <div>Player {player.name}</div>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          takeCard();
        }}
      >
        Take
      </button>
      {player.hand.map((card, index) => (
        <ShowCard key={index} card={card} onPlay={playCard} />
      ))}
    </div>
  );
}
