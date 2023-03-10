import { Card } from '../types';

interface ShowCardProps {
  card: Card;
  onPlay?: (card: Card) => void;
}

export function ShowCard(props: ShowCardProps) {
  const { card, onPlay } = props;
  return (
    <div onClick={() => onPlay && onPlay(card)}>
      {card.suit} {card.face}
    </div>
  );
}
