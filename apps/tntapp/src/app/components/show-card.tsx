import '../styles/cardStyle.css';
import { Card } from '../types';

interface ShowCardProps {
  card: Card;
  onPlay?: (card: Card) => void;
  size: 'small' | 'large';
}

const images = {
  heart: 'https://cdn-icons-png.flaticon.com/128/210/210545.png',
  acorn: 'https://cdn-icons-png.flaticon.com/128/676/676447.png',
  leaf: 'https://cdn-icons-png.flaticon.com/128/892/892917.png',
  bell: 'https://cdn-icons-png.flaticon.com/128/9004/9004824.png',
};

export function ShowCard(props: ShowCardProps) {
  const { card, onPlay } = props;
  const [sizeX, sizeY] = props.size === 'small' ? [20, 30] : [80, 110];

  if (!card) return null;

  return (
    <div
      className="card"
      onClick={() => onPlay && onPlay(card)}
      style={{ width: sizeX, height: sizeY }}
    >
      <div className="card-face card-corner-top-left">{card.face}</div>
      <div className="card-suit">
        <img
          className="card-image"
          src={images[card.suit]}
          alt={card.suit}
        ></img>
      </div>
      <div className="card-face card-corner-bottom-right">{card.face}</div>
    </div>
  );
}
