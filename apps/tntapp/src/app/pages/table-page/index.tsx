import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ShowCard } from '../../components/show-card';
import { getServerUrl } from '../../global';
import { Card } from '../../types';
import '../../styles/cardStyle.css';
import '../../styles/table-page.css';
import { useAuth } from '../../components/auth/auth-context';
import useWebSocket from 'react-use-websocket';

interface TableData {
  players: { name: string; id: string | undefined }[];
  hand: Card[];
  lastPlayedCards: Card[];
  waitingForPlayers: boolean;
  currentPlayer: number;
  ownerOfTableId: string;
  gameInProgress: boolean;
  leadingPlayerId: string;
}

interface ChairProps {
  chairPosition: string;
  playerName: string;
  lastPlayedCard: Card;
  currentPlayer: boolean;
}
interface MessageBase {
  type:
    | 'login'
    | 'playCard'
    | 'tableData'
    | 'loginFailure'
    | 'error'
    | 'startGame'
    | 'endRound';
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
  token?: string;
}

export interface MessageError extends MessageBase {
  error: string;
}

function Chair(props: ChairProps) {
  const { chairPosition, playerName, lastPlayedCard, currentPlayer } = props;
  return (
    <div className={`chair ${chairPosition}`}>
      {currentPlayer && (
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
      <div className="player on-chair"></div>
      <div className="player body"></div>
      <div className="name">{playerName}</div>
      <div className="on-chair last-played-card ">
        <ShowCard key="lastPCard1" card={lastPlayedCard} size="small" />
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
  const [errorMessage, setErrorMessage] = useState<string>();
  const { logout } = useAuth();
  const navigate = useNavigate();

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
        setErrorMessage('Could not Login');
        setTimeout(() => setErrorMessage(undefined), 3000);
      }
      if (lastJsonMessage.type === 'error') {
        const m: MessageError = lastJsonMessage as MessageError;
        setErrorMessage(m.error);
        setTimeout(() => setErrorMessage(undefined), 3000);
      }
    }
  }, [lastJsonMessage, token, setIsLoading]);

  const handlePlayCard = (c: Card) => {
    if (!id) return;
    const message: MessagePlayCard = {
      card: c,
      type: 'playCard',
      tableId: id,
      token,
    };
    sendJsonMessage(message);
    console.log(c, 'handlePlayCard');
  };
  const handleStartGame = () => {
    if (!isOwner) return;
    if (!id) return;
    const message: MessageBase = {
      type: 'startGame',
      tableId: id,
    };
    sendJsonMessage(message);
    console.log('handleStartGame');
  };

  const handlePlayerPass = () => {
    if (!id) return;
    const message: MessageBase = {
      type: 'endRound',
      tableId: id,
    };
    sendJsonMessage(message);
    console.log('handlePlayerPass');
  };

  const isOwner = data?.ownerOfTableId === token;

  if (isLoading)
    return (
      <div>
        <div>Waiting for server connection...</div>
        <button onClick={() => navigate('/')}>Back to Lobby</button>
      </div>
    );
  if (!data || playerIdx === undefined) return <div>Unknown Player</div>;
  return (
    <div>
      <div className="header">
        <h1 className="name-header">{data.players[playerIdx].name}</h1>
        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
        >
          Disconnect
        </button>
        {isOwner && !data.waitingForPlayers && !data.gameInProgress && (
          <button
            onClick={handleStartGame}
            className="btn btn-secondary startGameButton"
          >
            PRESS TO START GAME
          </button>
        )}
        <div>{errorMessage}</div>
      </div>
      <div className="table">
        <Chair
          chairPosition="top"
          playerName={data.players[(playerIdx + 2) % 4].name}
          lastPlayedCard={data.lastPlayedCards[2]}
          currentPlayer={data.currentPlayer === (playerIdx + 2) % 4}
        />
        <Chair
          chairPosition="left"
          playerName={data.players[(playerIdx + 1) % 4].name}
          lastPlayedCard={data.lastPlayedCards[1]}
          currentPlayer={data.currentPlayer === (playerIdx + 1) % 4}
        />
        <Chair
          chairPosition="right"
          playerName={data.players[(playerIdx + 3) % 4].name}
          lastPlayedCard={data.lastPlayedCards[3]}
          currentPlayer={data.currentPlayer === (playerIdx + 3) % 4}
        />
        <div className="chair bottom">
          <div className="player on-chair"></div>
          <div className="player body"></div>
          {data.currentPlayer === playerIdx && (
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
        </div>
        <div className="card-cast">
          <ShowCard
            key={'lastPcard'}
            card={data.lastPlayedCards[(data.currentPlayer + 3) % 4]}
            size="large"
          />
        </div>
      </div>
      {/* TODO: make pass button apear only on the second turn */}
      <div className="cards">
        <div>
          {data.leadingPlayerId === token && (
            <button className="passButton" onClick={handlePlayerPass}>
              PASS
            </button>
          )}
        </div>
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
