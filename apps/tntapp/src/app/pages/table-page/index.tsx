import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShowCard } from '../../components/show-card';
import { getServerUrl } from '../../global';
import { fetchData } from '../../lib/api';
import { Card } from '../../types';
import '../../styles/cardStyle.css';
import '../../styles/table-page.css';
import { postData } from '../../lib/api';

interface TableData {
  players: string[];
  hand: Card[];
  lastPlayedCards: Card[];
}

interface ChairProps {
  chairPosition: string;
  playerName: string;
  onPlay: (c: Card) => void;
  lastPlayedCard: Card;
}

function Chair(props: ChairProps) {
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

export function TablePage() {
  const params = useParams();
  const id = params.id;

  const [data, setData] = useState<TableData>();
  console.log('data', data);

  useEffect(() => {
    if (id) fetchData(getServerUrl().tableUrl(id)).then((d) => setData(d));
  }, [id]);

  const handlePlayCard = (c: Card) => {
    if (!id) return;
    postData(getServerUrl().tableUrl(id), { ...c, cmd: 'Play' });

    console.log(c, 'handlePlayCard');
  };

  if (!data) return null;
  return (
    <div>
      <div className="header">
        <h1 className="name-header">{data.players[3]}</h1>
      </div>
      <div className="table">
        <Chair
          chairPosition="top"
          playerName={data.players[0]}
          onPlay={handlePlayCard}
          lastPlayedCard={data.lastPlayedCards[0]}
        />
        <Chair
          chairPosition="left"
          playerName={data.players[1]}
          onPlay={handlePlayCard}
          lastPlayedCard={data.lastPlayedCards[1]}
        />
        <Chair
          chairPosition="right"
          playerName={data.players[2]}
          onPlay={handlePlayCard}
          lastPlayedCard={data.lastPlayedCards[2]}
        />
        <div className="chair bottom">
          <div className="player on-chair"></div>
          <div className="player body"></div>
        </div>
        <div className="card-cast"></div>
      </div>
      <div className="cards">
        {data.hand.map((card) => (
          <ShowCard
            key={card.id}
            onPlay={handlePlayCard}
            card={card}
            size="large"
          />
        ))}
      </div>
    </div>
  );
}

/*
playCard
pass
newGame



*/
