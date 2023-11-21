import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ShowCard } from '../../components/show-card';
import { getServerUrl } from '../../global';
import '../../styles/cardStyle.css';
import '../../styles/table-page.css';
import { useAuth } from '../../components/auth/auth-context';
import useWebSocket from 'react-use-websocket';
import {
  CardData,
  Message,
  MessageBase,
  MessageChat,
  MessageError,
  MessageLogin,
  MessagePlayCard,
  MessagePlayerIdx,
  MessageTableData,
  TableData,
} from '@tnt-react/ws-messages';
import { EndGameResultsPopup } from './components/end-game-results-popup';
import { StakesReachedPopup } from './components/stakes-reached-popup';
import { RoundResultsPopup } from './components/round-results-popup';
import { PlayAgainPopup } from './components/play-again-popup';
import { DisconnectPopup } from './components/disconnect-popup';

interface ChairProps {
  chairPosition: string;
  playerName: string;
  lastPlayedCard: CardData;
  currentPlayer: boolean;
  winningPlayer: boolean;
  bodyColor: string;
}

function Chair(props: ChairProps) {
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

export function TablePage() {
  const params = useParams();
  const id = params.id;
  const chatContainerRef = useRef(null);

  const [data, setData] = useState<TableData>();
  const [playerIdx, setPlayerIdx] = useState<number>();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [menuOpen, setMenuOpen] = useState(false);
  const [disconnectRequest, setDisconnectRequest] = useState(false);
  const [kickedOut, setKickedOut] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [receivedMessages, setReceivedMessages] = useState<Message[]>([]);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const [unopenedMessage, setUnopenedMessage] = useState(0);
  const [lastReceivedMessage, setLastReceivedMessage] =
    useState<MessageChat | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showEndGameResults, setShowEndGameResults] = useState(false);
  const [askGameContinue, setAskGameContinue] = useState(false);
  const [waitingForOwner, setWaitingForOwner] = useState(true);

  const { logout } = useAuth();
  const navigate = useNavigate();

  console.log('data', data);
  const { token } = useAuth();

  const { sendJsonMessage, lastJsonMessage } = useWebSocket<MessageBase>(
    getServerUrl().tableUrl,
    {
      onOpen: () => {
        if (token && id) {
          const message: MessageLogin = { token, type: 'login', tableId: id };
          sendJsonMessage(message);
        }
      },

      shouldReconnect: (closeEvent) => true,
    }
  );

  useEffect(() => {
    if (lastJsonMessage !== null) {
      console.log(lastJsonMessage, 'this is the last message');
      if (lastJsonMessage.type === 'tableData') {
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
      if (lastJsonMessage.type === 'forcePlayerDisconnect') {
        console.log('leaving table');
        setKickedOut(true);
        setTimeout(() => {
          setKickedOut(false);
          logout();
          navigate('/');
        }, 1500);
      }
      if (lastJsonMessage?.type === 'chatMessage') {
        console.log('Received chat message:', lastJsonMessage);
        const newMessage = lastJsonMessage as MessageChat;
        setReceivedMessages((prevMessages) => [
          ...prevMessages,
          {
            username: newMessage.username,
            message: newMessage.message,
          },
        ]);
        setLastReceivedMessage(newMessage);
      }
      if (lastJsonMessage?.type === 'showResults') {
        setShowResults(true);
      }
      if (lastJsonMessage?.type === 'showEndGameResults') {
        setShowEndGameResults(true);
      }
      if (lastJsonMessage?.type === 'askGameContinue') {
        setAskGameContinue(true);
      }
      if (lastJsonMessage?.type === 'startingGame') {
        setWaitingForOwner(false);
      }
    }
  }, [lastJsonMessage, token, setIsLoading, data, logout, navigate]);

  useEffect(() => {
    if (lastReceivedMessage && data && playerIdx !== undefined) {
      const formattedMessage = `<strong>${lastReceivedMessage.username}</strong><br>${lastReceivedMessage.message}`;

      if (lastReceivedMessage.username === data.players[playerIdx].name) {
        setUnopenedMessage(0);
        return;
      }

      if (!chatOpen) {
        setUnopenedMessage((prevUnopenedMessage) => prevUnopenedMessage + 1);
        setPopupMessage(formattedMessage);

        const popupTimer = setTimeout(() => {
          setPopupMessage(null);
        }, 2000);

        return () => clearTimeout(popupTimer);
      }
    }
    setLastReceivedMessage(null);
  }, [chatOpen, data, lastReceivedMessage, playerIdx, receivedMessages]);

  const handlePlayCard = (c: CardData) => {
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
    setShowResults(false);

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
    setShowEndGameResults(false);
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
    setAskGameContinue(false);
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

  const handleDisconnect = () => {
    setDisconnectRequest(true);
  };

  const isOwner = data?.ownerOfTableId === token;
  const playerCount = data?.players.filter((p) => p.name !== '').length;
  const roundWinner = data?.players.find(
    (p) => p.id === data.winningPlayerId
  )?.name;

  const handleLeave = () => {
    if (!id || !data || playerIdx === undefined) return;

    const message: MessagePlayerIdx = {
      type: 'handleLeave',
      tableId: id,
      playerIdx: playerIdx,
    };
    sendJsonMessage(message);
    console.log('handleLeave');
  };

  const handleResume = () => {
    setDisconnectRequest(false);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  const toggleChat = () => {
    setChatOpen(!chatOpen);
    setUnopenedMessage(0);
  };

  const handleSendMessage = () => {
    if (inputMessage && id && playerIdx !== undefined) {
      const newMessage: MessageChat = {
        type: 'chatMessage',
        tableId: id,
        username: data?.players[playerIdx].name || '',
        message: inputMessage,
      };

      sendJsonMessage(newMessage);
      console.log('sending chat message');

      setInputMessage('');
    }
  };
  const myBodyColor =
    data && playerIdx !== undefined
      ? data.players[playerIdx].bodyColor
      : 'black';

  const shouldShowButton = isLeadPlayer() && canPass() && isCurrentPlayer();

  if (isLoading)
    return (
      <div>
        <h2 style={{ marginTop: '20px', marginBottom: '0px' }}>
          Waiting for server connection...
        </h2>
        <p>Please be pacient</p>
        <button className="returnToButton" onClick={() => navigate('/')}>
          Return
        </button>
      </div>
    );
  if (!data || playerIdx === undefined) return <div>Unknown Player</div>;
  return (
    <div>
      <div className="header">
        <h1 className="name-header">{data.players[playerIdx].name}</h1>
        {chatOpen && (
          <div className="chat-popup" ref={chatContainerRef}>
            <div className="chat-messages">
              {receivedMessages.map((msg, index) => (
                <div key={index} className="chat-message">
                  <p className="message-username">{msg.username}</p>
                  <p className="message-text">{msg.message}</p>
                </div>
              ))}
            </div>
            <div className="chat-input">
              <input
                type="text"
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
              />
              <button onClick={handleSendMessage}>Send</button>
            </div>
          </div>
        )}
        {popupMessage && !chatOpen && (
          <div
            className="popup-message"
            dangerouslySetInnerHTML={{ __html: popupMessage }}
          ></div>
        )}

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
                <i
                  id="chat"
                  className="fas fa-comment"
                  onClick={toggleChat}
                ></i>
                {unopenedMessage > 0 && (
                  <div className="message-count">{unopenedMessage}</div>
                )}
              </div>
              <div className="menu-item">
                <i id="settings" className="fas fa-cog"></i>
              </div>
              <div className="menu-item">
                <i
                  id="disconnect"
                  className="fas fa-sign-out-alt"
                  onClick={handleDisconnect}
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
        {askGameContinue && (
          <button
            onClick={handleStakesNotReached}
            className="btn btn-secondary startGameButton"
          >
            The stakes weren't reached
            <br></br>
            TAP TO CONTINUE
          </button>
        )}
        <div></div>
        {data.waitingForPlayers && (
          <div className="info-message">
            <p className="centreMessage">
              {' '}
              Waiting for players to join : {playerCount}/4{' '}
            </p>
          </div>
        )}
        {!isOwner && waitingForOwner && !data.waitingForPlayers && (
          <div className="info-message">
            <p className="centreMessage">Waiting for Owner to Start Game</p>
          </div>
        )}
      </div>
      <div className="table">
        <Chair
          chairPosition="top"
          playerName={data.players[(playerIdx + 2) % 4].name}
          lastPlayedCard={data.lastPlayedCards[(playerIdx + 2) % 4]}
          currentPlayer={data.currentPlayer === (playerIdx + 2) % 4}
          winningPlayer={
            data.players[(playerIdx + 2) % 4].id === data.winningPlayerId
          }
          bodyColor={data.players[(playerIdx + 2) % 4].bodyColor}
        />
        <Chair
          chairPosition="left"
          playerName={data.players[(playerIdx + 1) % 4].name}
          lastPlayedCard={data.lastPlayedCards[(playerIdx + 1) % 4]}
          currentPlayer={data.currentPlayer === (playerIdx + 1) % 4}
          winningPlayer={
            data.players[(playerIdx + 1) % 4].id === data.winningPlayerId
          }
          bodyColor={data.players[(playerIdx + 1) % 4].bodyColor}
        />
        <Chair
          chairPosition="right"
          playerName={data.players[(playerIdx + 3) % 4].name}
          lastPlayedCard={data.lastPlayedCards[(playerIdx + 3) % 4]}
          currentPlayer={data.currentPlayer === (playerIdx + 3) % 4}
          winningPlayer={
            data.players[(playerIdx + 3) % 4].id === data.winningPlayerId
          }
          bodyColor={data.players[(playerIdx + 3) % 4].bodyColor}
        />
        <div className="chair bottom">
          <div className="player on-chair"></div>
          <div
            className="player body"
            style={{ backgroundColor: myBodyColor }}
          ></div>
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
            key={card.face + card.suit}
            onPlay={handlePlayCard}
            card={card}
            size="large"
          />
        ))}
      </div>
      {kickedOut && (
        <div className="disconnectPopup">
          <h3>DISCONNECTED</h3>
          <p>
            The owner disconnected,
            <br></br>leaving table...
          </p>
        </div>
      )}
      {showResults && (
        <RoundResultsPopup
          onClose={handleCloseResults}
          dealWinnerName={roundWinner}
          dealWinnerTeam={data.teamWonRound}
          wonPoints={data.wonPoints}
          isLastRound={data.round === 8}
        />
      )}
      {showEndGameResults && (
        <EndGameResultsPopup
          onClose={handleCloseEndGameResults}
          teamWonRound={data.teamWonRound}
          winningTeamPoints={data.winningTeamPoints}
          finalStakeCount={data.finalStakeCount}
          teamAStakeCount={data.teamAStakeCount}
          teamBStakeCount={data.teamBStakeCount}
        />
      )}
      {data.stakesReached && (
        <StakesReachedPopup
          onClose={handleStakesReached}
          winningTeam={whoWon()}
          winningStakeCount={winningStakeCount()}
          finalStakeCount={data.finalStakeCount}
        />
      )}
      {data.playAgain && (
        <PlayAgainPopup
          onPlay={handleStartGame}
          onLeave={() => {
            logout();
            navigate('/');
          }}
        />
      )}
      {disconnectRequest && (
        <DisconnectPopup
          onResume={handleResume}
          onLeave={handleLeave}
          isOwner={isOwner}
        />
      )}
    </div>
  );
}
