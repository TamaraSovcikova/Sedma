import { ShowCard } from "../../../components/show-card";
import { Card } from "../../../types";

interface ChairProps {
  chairPosition: 'top'|'left'|'right'|'bottom' ;
  playerName: string;
  onPlay: (c: Card) => void;
  lastPlayedCard: Card;
}

export function Chair(props: ChairProps) {
  const { chairPosition, playerName, onPlay, lastPlayedCard } = props;
  return (
    <div className={`chair ${chairPosition}`}>
      <div className="player on-chair"></div>
      <div className="player body"></div>
      <div className="name">{playerName}</div>
      <div className="on-chair last-played-card">
        <ShowCard
          key="lastPCard1"
          onPlay={onPlay}
          card={lastPlayedCard}
          size="small"
        />
      </div>
    </div>
  );
}