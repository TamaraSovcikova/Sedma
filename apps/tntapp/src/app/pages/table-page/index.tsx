import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShowCard } from '../../components/show-card';
import { getServerUrl } from '../../global';
import { fetchData } from '../../lib/api';
import { Card } from '../../types';
import '../../styles/cardStyle.css';
import '../../styles/table-page.css';
import { postData } from '../../lib/api';
import { useAuth } from '../../components/auth/auth-context';
import useWebSocket from 'react-use-websocket';

interface TableData {
  players: { name: string; id: string | undefined }[];
  hand: Card[];
  lastPlayedCards: Card[];
}

interface ChairProps {
  chairPosition: string;
  playerName: string;
  onPlay: (c: Card) => void;
  lastPlayedCard: Card;
}
interface MessageBase {
  type: 'login' | 'playCard' | 'tableData' | 'loginFailure';
  tableId: string;
}

interface MessageLogin extends MessageBase {
  token: string;
}

interface MessageTableData extends MessageBase {
  data: TableData;
}

interface MessagePlayCard extends MessageBase {
  card: Card;
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
  const [playerIdx, setPlayerIdx] = useState<number>();
  const [isLoading, setIsLoading] = useState(true);

  console.log('data', data);
  const { token } = useAuth();

  const { sendJsonMessage, lastJsonMessage, getWebSocket } =
    useWebSocket<MessageBase>(getServerUrl().tableUrl, {
      onOpen: () => {
        if (token && id) {
          const message: MessageLogin = { token, type: 'login', tableId: id };
          sendJsonMessage(message);
        }
      },

      shouldReconnect: (closeEvent) => true,
    });

  useEffect(() => {
    if (lastJsonMessage !== null) {
      console.log(lastJsonMessage, 'this is the last message');
      if (lastJsonMessage.type === 'tableData') {
        console.log('entered table data');
        const d: MessageTableData = lastJsonMessage as MessageTableData;
        setData(d.data);
        const playerIdx = d.data.players.findIndex((p) => p.id === token);
        if (playerIdx >= 0) {
          setPlayerIdx(playerIdx);
        } else setPlayerIdx(undefined);
        setIsLoading(false);
      }
      if (lastJsonMessage.type === 'loginFailure') {
        setIsLoading(true);
        //TODO: display error (something other than isLoading)
      }
    }
  }, [lastJsonMessage, token, setIsLoading]);

  const handlePlayCard = (c: Card) => {
    if (!id) return;
    const message: MessagePlayCard = { card: c, type: 'playCard', tableId: id };
    sendJsonMessage(message);
    console.log(c, 'handlePlayCard');
  };

  if (isLoading) return <div>Waiting for server connection...</div>;
  if (!data || playerIdx === undefined) return <div>Unknown Player</div>;
  return (
    <div>
      <div className="header">
        <h1 className="name-header">{data.players[playerIdx].name}</h1>
      </div>
      <div className="table">
        <Chair
          chairPosition="top"
          playerName={data.players[(playerIdx + 2) % 4].name}
          onPlay={handlePlayCard}
          lastPlayedCard={data.lastPlayedCards[0]}
        />
        <Chair
          chairPosition="left"
          playerName={data.players[(playerIdx + 1) % 4].name}
          onPlay={handlePlayCard}
          lastPlayedCard={data.lastPlayedCards[1]}
        />
        <Chair
          chairPosition="right"
          playerName={data.players[(playerIdx + 3) % 4].name}
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
