import { CardData } from '@tnt-react/ws-messages';
import { ShowCard } from '../../../components/show-card';

interface ChairProps {
  chairPosition: string;
  playerName: string;
  lastPlayedCard: CardData;
  currentPlayer: boolean;
  winningPlayer: boolean;
  bodyColor: string;
}

export function Chair(props: ChairProps) {
  const {
    chairPosition,
    playerName,
    lastPlayedCard,
    currentPlayer,
    winningPlayer,
    bodyColor,
  } = props;
  return (
    <div className={`chair ${chairPosition}`}>
      {currentPlayer && (
        <img
          src="https://cdn-icons-png.flaticon.com/512/116/116145.png"
          alt="sunglasses"
          style={{
            width: '50px',
            height: '50px',
            background: 'transparent',
            top: '-30px',
            position: 'absolute',
            zIndex: '3',
            left: '-0.5px',
          }}
        />
      )}
      {winningPlayer && (
        <img
          src="https://clipart-library.com/newimages/crown-clip-art-18.png"
          alt="crown"
          style={{
            width: '50px',
            height: '50px',
            background: 'transparent',
            top: '-60px',
            position: 'absolute',
            left: '-1px',
          }}
        />
      )}
      {playerName && (
        <div>
          <div className="player on-chair"></div>
          <div
            className="player body"
            style={{ backgroundColor: bodyColor }}
          ></div>
        </div>
      )}
      <div className="name">{playerName}</div>
      <div className="on-chair last-played-card ">
        <ShowCard key="lastPCard1" card={lastPlayedCard} size="small" />
      </div>
    </div>
  );
}
