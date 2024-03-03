import { CardData } from '@tnt-react/ws-messages';
import { Player } from '../types';
import { ShowCard } from './show-card';

interface ShowPlayerProps {
  player: Player;
  playCard: (card: CardData) => void;
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
      {/* Rendering out cards the player has onhand */}
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
