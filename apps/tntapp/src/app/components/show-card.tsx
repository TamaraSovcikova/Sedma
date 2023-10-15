import { CardData } from '@tnt-react/ws-messages';
import '../styles/cardStyle.css';

interface ShowCardProps {
  card: CardData;
  onPlay?: (card: CardData) => void;
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
  const [sizeX, sizeY] = props.size === 'small' ? [55, 75] : [90, 120];
  const cardFontSize = props.size === 'small' ? '17px' : '22px';
  const topText = props.size === 'small' ? '-15px' : '-7px';
  const bottomText = props.size === 'small' ? '-17px' : '-7px';
  const iconSize = props.size === 'small' ? '80%' : '100%';

  if (!card) return null;

  return (
    <div
      className="card"
      onClick={() => onPlay && onPlay(card)}
      style={{
        width: sizeX,
        height: sizeY,
        fontSize: cardFontSize,
      }}
    >
      <div
        className="card-face card-corner-top-left"
        style={{
          top: topText,
        }}
      >
        {card.face}
      </div>
      <div className="card-suit">
        <img
          className="card-image"
          src={images[card.suit]}
          alt={card.suit}
          style={{
            maxHeight: iconSize,
            maxWidth: iconSize,
          }}
        ></img>
      </div>
      <div
        className="card-face card-corner-bottom-right"
        style={{
          bottom: bottomText,
        }}
      >
        {card.face}
      </div>
    </div>
  );
}
