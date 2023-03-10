import { Card, Player } from '../types';
import { ShowCard } from './show-card';

interface ShowPlayerProps {
  player: Player;
  playCard: (card: Card) => void;
  takeCard: () => void;
  current: boolean;
}

export function ShowPlayer(props: ShowPlayerProps) {
  const { player, playCard, takeCard, current } = props;
  return (
    <div>
      <div>
        {current ? <strong>Player</strong> : 'Player'} {player.name}
      </div>
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
