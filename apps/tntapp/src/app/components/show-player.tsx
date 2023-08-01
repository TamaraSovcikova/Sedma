import { Card, Player } from '../types';
import { ShowCard } from './show-card';

interface ShowPlayerProps {
  player: Player;
  playCard: (card: Card) => void;
  takeCard: () => void;
  current: boolean;
}

export function ShowPlayer(props: ShowPlayerProps) {
  const { player, playCard, current } = props;

  return (
    <div>
      <div>
        {current ? <strong>Player</strong> : 'Player'} {player.name}
      </div>
      {player.hand.map((card, index) => (
        <ShowCard
          key={index}
          card={card}
          onPlay={() => {
            if (current) playCard(card);
          }}
          size={'large'}
        />
      ))}
    </div>
  );
}
