import { Card, Player } from '../types';
import { ShowCard } from './show-card';

interface ShowPlayerProps {
  player: Player;
  playCard: (card: Card) => void;
  handOutCard: () => void;
  current: boolean;
}

export function ShowPlayer(props: ShowPlayerProps) {
  const { player, playCard, handOutCard, current } = props;

  return (
    <div>
      <div>
        {current ? <strong>Player</strong> : 'Player'} {player.name}
      </div>
      {player.hand.map((card, index) => (
        <ShowCard key={index} card={card} onPlay={() => playCard(card)} />
      ))}
    </div>
  );
}
