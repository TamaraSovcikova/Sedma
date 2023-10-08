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
  winningPlayerId: string;
  leadPlayerId: string;
  round?: number;
  teamWonRound: string;
  wonPoints: number;
  showresults: boolean;
  gameEnd: boolean;
  teamAStakeCount: number;
  teamBStakeCount: number;
  finalStakeCount: number;
  teamAPoints?: number;
  teamBPoints?: number;
  askContinue: boolean;
  stakesReached: boolean;
  playAgain: boolean;
  isFirstDeal: number;
}

interface ChairProps {
  chairPosition: string;
  playerName: string;
  lastPlayedCard: Card;
  currentPlayer: boolean;
  winningPlayer: boolean;
}
interface MessageBase {
  type:
    | 'login'
    | 'playCard'
    | 'tableData'
    | 'loginFailure'
    | 'error'
    | 'startGame'
    | 'endRound'
    | 'closeResults'
    | 'closeEndGameResults'
    | 'handleStakesNotReached'
    | 'handleStakesReached';
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

export interface MessagePlayerIdx extends MessageBase {
  playerIdx: number;
}
function Chair(props: ChairProps) {
  const {
    chairPosition,
    playerName,
    lastPlayedCard,
    currentPlayer,
    winningPlayer,
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
  const [menuOpen, setMenuOpen] = useState(false);

  const { logout } = useAuth();
  const navigate = useNavigate();

  console.log('data', data);
  const { token } = useAuth();
  // TODO: when a player loggs on make it so that that is when the character apears on the seat, other than that dont show them.
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
  }, [lastJsonMessage, token, setIsLoading, data]);

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

  const handleCloseResults = () => {
    if (!id || playerIdx === undefined) return;

    const message: MessagePlayerIdx = {
      type: 'closeResults',
      tableId: id,
      playerIdx: playerIdx,
    };
    sendJsonMessage(message);
    console.log('handleCloseResults');
  };

  const handleCloseEndGameResults = () => {
    if (!id || playerIdx === undefined) return;
    const message: MessagePlayerIdx = {
      type: 'closeEndGameResults',
      tableId: id,
      playerIdx: playerIdx,
    };
    sendJsonMessage(message);
    console.log('handleCloseEndGameResults');
  };
  const handleStakesNotReached = () => {
    if (!id) return;
    const message: MessageBase = {
      type: 'handleStakesNotReached',
      tableId: id,
    };
    sendJsonMessage(message);
    console.log('handleStakesNotReached');
  };
  const handleStakesReached = () => {
    if (!id || !data) return;
    const message: MessageBase = {
      type: 'handleStakesReached',
      tableId: id,
    };
    sendJsonMessage(message);
    console.log('handleStakesReached');
  };

  const canPass = () => {
    if (data?.isFirstDeal) {
      return data?.isFirstDeal > 0;
    }
  };

  const isLeadPlayer = () => {
    if (data?.leadPlayerId === token) {
      return true;
    } else return false;
  };
  const isCurrentPlayer = () => {
    return data?.players[data.currentPlayer].id === token;
  };

  const winningTeamPoints = () => {
    if (data) {
      const teamAPoints = data?.teamAPoints ?? 0;
      const teamBPoints = data?.teamBPoints ?? 0;

      if (teamAPoints > teamBPoints) {
        return teamAPoints;
      } else {
        return teamBPoints;
      }
    }
  };
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const whoWon = () => {
    if (data)
      if (data?.teamAStakeCount > data?.teamBStakeCount) return 'TEAM A';
      else return 'TEAM B';
  };
  const winningStakeCount = () => {
    if (data)
      if (data?.teamAStakeCount > data?.teamBStakeCount)
        return data.teamAStakeCount;
      else return data.teamBStakeCount;
  };
  const shouldShowButton = isLeadPlayer() && canPass() && isCurrentPlayer();

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
        <div className="top-right-menu">
          <div
            className={`icon ${menuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
          >
            <i className="fas fa-ellipsis-v"></i>
          </div>
          {menuOpen && (
            <div className="dropdown-menu">
              <div className="menu-item">
                <i id="chat" className="fas fa-comment"></i>
              </div>
              <div className="menu-item">
                <i id="settings" className="fas fa-cog"></i>
              </div>
              <div className="menu-item">
                <i
                  id="disconnect"
                  className="fas fa-sign-out-alt"
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                ></i>
              </div>
            </div>
          )}
        </div>

        {isOwner && !data.waitingForPlayers && !data.gameInProgress && (
          <button
            onClick={handleStartGame}
            className="btn btn-secondary startGameButton"
          >
            TAP TO START GAME
          </button>
        )}
        {data.askContinue && (
          <button
            onClick={handleStakesNotReached}
            className="btn btn-secondary startGameButton"
          >
            The stakes weren't reached
            <br></br>
            TAP TO CONTINUE
          </button>
        )}
        <div>
          <h5>Round: {data.round}/8</h5>
        </div>
      </div>
      <div className="table">
        <Chair
          chairPosition="top"
          playerName={data.players[(playerIdx + 2) % 4].name}
          lastPlayedCard={data.lastPlayedCards[2]}
          currentPlayer={data.currentPlayer === (playerIdx + 2) % 4}
          winningPlayer={
            data.players[(playerIdx + 2) % 4].id === data.winningPlayerId
          }
        />
        <Chair
          chairPosition="left"
          playerName={data.players[(playerIdx + 1) % 4].name}
          lastPlayedCard={data.lastPlayedCards[1]}
          currentPlayer={data.currentPlayer === (playerIdx + 1) % 4}
          winningPlayer={
            data.players[(playerIdx + 1) % 4].id === data.winningPlayerId
          }
        />
        <Chair
          chairPosition="right"
          playerName={data.players[(playerIdx + 3) % 4].name}
          lastPlayedCard={data.lastPlayedCards[3]}
          currentPlayer={data.currentPlayer === (playerIdx + 3) % 4}
          winningPlayer={
            data.players[(playerIdx + 3) % 4].id === data.winningPlayerId
          }
        />
        <div className="chair bottom">
          <div className="player on-chair"></div>
          <div className="player body"></div>
          {data.players[playerIdx].id === data.winningPlayerId && (
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
          {data.currentPlayer === playerIdx && (
            <img
              src="https://cdn-icons-png.flaticon.com/512/116/116145.png"
              alt="sunglasses"
              style={{
                width: '50px',
                height: '50px',
                background: 'transparent',
                top: '-30px',
                position: 'absolute',
                left: '-0.5px',
                zIndex: '3',
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
      <div>
        <div className="aboveCards" style={{ color: 'rgb(239, 126, 126)' }}>
          {errorMessage}
        </div>
        {shouldShowButton && (
          <button className="passButton" onClick={handlePlayerPass}>
            PASS
          </button>
        )}
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
      {/* TODO: display a last deal bosun of ten points in the result at the last deal, br to separate tap to continue */}
      {/* {todo, add a better looking waiting for server connection screen} */}
      {/* add a character limit for names and deal with them */}
      {data.showresults && (
        <div className="resultsPopup">
          <div className="resultsBox">
            <button className="closeButton" onClick={handleCloseResults}>
              X
            </button>
            <h2>Round Results</h2>
            <p>
              Player who Won the deal :{' '}
              <span className="dynamicData">
                {data.players.find((p) => p.id === data.winningPlayerId)?.name}
              </span>
            </p>
            <p>
              Their team:{' '}
              <span className="dynamicData">{data.teamWonRound}</span>
            </p>
            <p>
              Points Collected:{' '}
              <span className="dynamicData">{data.wonPoints}</span>
            </p>
            {data.round === 8 && (
              <p className="lastDealBonus">
                Last deal bonus <span className="dynamicData2">10</span>
              </p>
            )}
          </div>
        </div>
      )}
      {data.gameEnd && (
        <div className="resultsPopup" style={{ zIndex: 101 }}>
          <div className="resultsBox">
            <button className="closeButton" onClick={handleCloseEndGameResults}>
              X
            </button>
            <h2>GAME FINISHED</h2>
            <p>
              Team who won the game!:{' '}
              <span className="dynamicData"> {data.teamWonRound}</span>{' '}
            </p>
            <p>
              Points Collected:{' '}
              <span className="dynamicData">{winningTeamPoints()}</span>
            </p>
            <p>
              Stakes to HIT:{' '}
              <span className="dynamicData">{data.finalStakeCount}</span>
            </p>
            <p>
              Team A stake number:{' '}
              <span className="dynamicData">{data.teamAStakeCount}</span>
            </p>
            <p>
              Team B stake number:{' '}
              <span className="dynamicData">{data.teamBStakeCount}</span>
            </p>
          </div>
        </div>
      )}
      {data.stakesReached && (
        <div className="resultsPopup" style={{ zIndex: 102 }}>
          <div className="resultsBox">
            <button className="closeButton" onClick={handleStakesReached}>
              X
            </button>
            <h2>CONGRATS!</h2>
            <h5>Game has finished!</h5>
            <p>
              Team who won the game!:{' '}
              <span className="dynamicData"> {whoWon()}</span>{' '}
            </p>
            <p>
              Their stake count :{' '}
              <span className="dynamicData">{winningStakeCount()}</span>
            </p>
            <p>
              Stakes to HIT:{' '}
              <span className="dynamicData">{data.finalStakeCount}</span>
            </p>
          </div>
        </div>
      )}
      {data.playAgain && (
        <div className="resultsPopup">
          <div className="resultsBox" style={{ minHeight: '220px' }}>
            <h2>Do you wish to stay and play another game?</h2>
            <div className="button-container">
              <button className="button play-button" onClick={handleStartGame}>
                Lets Play!
              </button>
              <button
                className="button leave-button"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
