import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShowCard } from '../../components/show-card';
import { getGlobalApp } from '../../global';
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
export function TablePage() {
  const params = useParams();
  const id = params.id;

  const [data, setData] = useState<TableData>();
  console.log('data', data);

  useEffect(() => {
    if (id) fetchData(getGlobalApp().tableUrl(id)).then((d) => setData(d));
  }, [id]);

  const handlePlayCard = (c: Card) => {
    if (!id) return;
    postData(getGlobalApp().tableUrl(id), { ...c, cmd: 'Play' });

    console.log(c, 'handlePlayCard');
  };

  if (!data) return null;
  return (
    <div>
      <div className="header">
        <h1 className="name-header">{data.players[3]}</h1>
      </div>
      <div className="table">
        <div className="chair top">
          <div className="player on-chair"></div>
          <div className="player body"></div>
          <div className="name">{data.players[0]}</div>
          <div className="on-chair last-played-card">
            <ShowCard card={data.lastPlayedCards[0]} size="small" />
          </div>
        </div>
        <div className="chair left">
          <div className="player on-chair"></div>
          <div className="player body"></div>
          <div className="name">{data.players[1]}</div>
          <div className="on-chair last-played-card">
            <ShowCard card={data.lastPlayedCards[1]} size="small" />
          </div>
        </div>
        <div className="chair right">
          <div className="player on-chair"></div>
          <div className="player body"></div>
          <div className="name">{data.players[2]}</div>
          <div className="on-chair last-played-card">
            <ShowCard card={data.lastPlayedCards[2]} size="small" />
          </div>
        </div>
        <div className="chair bottom">
          <div className="player on-chair"></div>
          <div className="player body"></div>
        </div>
        <div className="card-cast"></div>
      </div>
      <div className="cards">
        {data.hand.map((card) => (
          <ShowCard onPlay={handlePlayCard} card={card} size="large" />
        ))}
      </div>
    </div>
  );
}
