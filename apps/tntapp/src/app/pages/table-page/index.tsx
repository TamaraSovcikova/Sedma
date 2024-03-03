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
import { Chair } from './components/chair';
import { Chat } from './components/chat';
import { Menu } from './components/menu';

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
  const [playAgain, setPlayAgain] = useState(false);
  const [stakesReached, setStakesReached] = useState(false);
  const [playerHasDisconnected, setPlayerHasDisconnected] = useState(false);
  const [popupTimer, setPopupTimer] = useState<NodeJS.Timeout>();

  const { logout } = useAuth();
  const navigate = useNavigate();

  const { token } = useAuth();

  // Setting up WebSocket connection and message handling.
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

  // Handle side effects related to WebSocket messages and state changes.
  useEffect(() => {
    // Handling different types of messages received from the server.
    if (lastJsonMessage !== null) {
      console.log(lastJsonMessage, 'this is the last message');

      //Processing data updates about Table from the server
      if (lastJsonMessage.type === 'tableData') {
        const d: MessageTableData = lastJsonMessage as MessageTableData;
        setData(d.data);
        const playerIdx = d.data.players.findIndex((p) => p.id === token);
        if (playerIdx >= 0) {
          setPlayerIdx(playerIdx);
        } else setPlayerIdx(undefined);
        setIsLoading(false);
      }

      // Handling login failure message.
      if (lastJsonMessage.type === 'loginFailure') {
        setIsLoading(true);
        setErrorMessage('Could not Login');
        setTimeout(() => setErrorMessage(undefined), 3000);
      }

      // Handling error message
      if (lastJsonMessage.type === 'error') {
        const m: MessageError = lastJsonMessage as MessageError;
        setErrorMessage(m.error);
        setTimeout(() => setErrorMessage(undefined), 3000);
      }

      // Handling forced player disconnect message.
      if (lastJsonMessage.type === 'forcePlayerDisconnect') {
        console.log('leaving table');
        setKickedOut(true);
        setTimeout(() => {
          setKickedOut(false);
          logout();
          navigate('/');
        }, 1500);
      }
      // Handling incoming chat message.
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

      if (lastJsonMessage?.type === 'letsPlayAgain') {
        setPlayAgain(true);
      }

      if (lastJsonMessage?.type === 'stakesReached') {
        setStakesReached(true);
      }

      if (lastJsonMessage?.type === 'disconnectingPlayer') {
        setPlayerHasDisconnected(true);
        setTimeout(() => {
          setPlayerHasDisconnected(false);
        }, 3000);
      }
    }
  }, [lastJsonMessage, token, setIsLoading, data, logout, navigate]);

  // useEffect hook to handle showing popup messages and updating unopened message count.
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

        setPopupTimer(
          setTimeout(() => {
            setPopupMessage(null);
          }, 2000)
        );
      }
    }
    setLastReceivedMessage(null);
  }, [
    chatOpen,
    data,
    lastReceivedMessage,
    playerIdx,
    receivedMessages,
    popupMessage,
  ]);

  //Player playes a card, message sent to server
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

  //Player chooses to stay connected to the table, message sent to server
  const handlePlayerStays = () => {
    setPlayAgain(false);
    setWaitingForOwner(true);

    if (!id || playerIdx === undefined) return;

    const message: MessagePlayerIdx = {
      type: 'playerStay',
      tableId: id,
      playerIdx: playerIdx,
    };
    sendJsonMessage(message);
    console.log('handlePlayerStays');
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

  //Message about player passing their turn
  const handlePlayerPass = () => {
    if (!id) return;
    const message: MessageBase = {
      type: 'endRound',
      tableId: id,
    };
    sendJsonMessage(message);
    console.log('handlePlayerPass');
  };

  //Message about closing popup results
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

  //Message about closing end game popup results
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
    setAskGameContinue(false);

    if (!id) return;
    if (!isOwner) return;

    const message: MessageBase = {
      type: 'handleStakesNotReached',
      tableId: id,
    };
    sendJsonMessage(message);
    console.log('handleStakesNotReached');
  };
  const handleStakesReached = () => {
    setStakesReached(false);
    setPlayAgain(true);
  };

  //Checking if its a round after the first deal
  const canPass = () => {
    if (data?.isFirstDeal) {
      return data?.isFirstDeal > 0;
    }
  };

  //Checking if player is the leadPlayer
  const isLeadPlayer = () => {
    if (data?.leadPlayerId === token) {
      return true;
    } else return false;
  };

  //Checking to see if player is the current player
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

  //Player is leaving table
  const handleLeave = () => {
    if (!id || !data || playerIdx === undefined) return;
    setPlayAgain(false);

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

  //Toggle opening and closing of the chat
  const toggleChat = () => {
    setChatOpen(!chatOpen);
    setUnopenedMessage(0);
  };

  //Player is sending a chat message
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

  //Using whatsapp to share link to the table
  function shareViaWhatsApp(tableId: string | undefined) {
    const message = `Join our Sedma game! Table ID: ${tableId}`;
    const landingPageUrl = `https://sedma.spv99.com/?tableId=${tableId}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
      message
    )}%0A%0A${encodeURIComponent(landingPageUrl)}`;
    window.open(whatsappUrl, '_blank');
  }

  //Copy to the clipboard
  const handleCopy = () => {
    const inputElement = document.getElementById(
      'table-id-input'
    ) as HTMLInputElement;
    const textToCopy = inputElement?.value || '';

    if (textToCopy) {
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    } else {
      alert('ERROR NO ID');
    }
  };

  const myBodyColor =
    data && playerIdx !== undefined
      ? data.players[playerIdx].bodyColor
      : 'black';

  const shouldShowButton = isLeadPlayer() && canPass() && isCurrentPlayer();

  //Handing the case when client didn't yet recieve table data from the server
  if (isLoading)
    return (
      <div>
        <h2 style={{ marginTop: '20px', marginBottom: '0px' }}>
          Waiting for server connection...
        </h2>
        <p>Please be patient</p>
        <button className="returnToButton" onClick={() => navigate('/')}>
          Return
        </button>
      </div>
    );

  if (!data || playerIdx === undefined) return <div>Unknown Player</div>;
  const topPlayerIdx = (playerIdx + 2) % 4;
  const leftPlayerIdx = (playerIdx + 1) % 4;
  const rightPlayerIdx = (playerIdx + 3) % 4;

  return (
    <div>
      <div className="header">
        <h1 className="name-header">{data.players[playerIdx].name}</h1>
        {chatOpen && (
          <Chat
            chatContainerReference={chatContainerRef}
            recievedMessages={receivedMessages}
            inputMessage={inputMessage}
            onSend={handleSendMessage}
            setInputMessage={setInputMessage}
          />
        )}
        {popupMessage && !chatOpen && (
          <div
            className="popup-message"
            dangerouslySetInnerHTML={{ __html: popupMessage }}
          ></div>
        )}
        <p>Round: {data.round} </p>
        <Menu
          menuOpen={menuOpen}
          openMenu={toggleMenu}
          toggleChat={toggleChat}
          unopenedMessage={unopenedMessage}
          onDisconnect={handleDisconnect}
        />

        {isOwner &&
          !data.waitingForPlayers &&
          !data.gameInProgress &&
          data.everyoneReady && (
            <button
              onClick={handleStartGame}
              className="btn btn-secondary startGameButton"
            >
              TAP TO START GAME
            </button>
          )}

        {askGameContinue && !showEndGameResults && (
          <button
            onClick={handleStakesNotReached}
            className="btn btn-secondary startGameButton"
          >
            The stakes weren't reached
            <br></br>
            TAP TO CONTINUE
          </button>
        )}

        {isOwner &&
          !data.waitingForPlayers &&
          !data.gameInProgress &&
          !data.everyoneReady && (
            <div className="info-message">
              <p>Please wait till everyone is ready</p>
            </div>
          )}

        {data.waitingForPlayers && (
          <div>
            <div className="info-message">
              <p> Waiting for players to join : {playerCount}/4 </p>
            </div>
            <div className="tableID-popup">
              <p className="tableID-text">
                Your Unique Table ID, send it to your friends to let them join!
              </p>
              <div className="input-group mt-2 justify-content-center">
                <input
                  id="table-id-input"
                  type="text"
                  className="form-control"
                  name="Table ID"
                  placeholder="Table ID"
                  value={id}
                  readOnly
                />
                <button
                  className="btn btn-secondary m-1 p-2"
                  onClick={handleCopy}
                >
                  Copy
                </button>
                <button
                  className="btn btn-secondary m-1"
                  onClick={() => shareViaWhatsApp(id)}
                >
                  <i className="fab fa-whatsapp"></i>
                </button>
              </div>
            </div>
          </div>
        )}
        {!isOwner && waitingForOwner && !data.waitingForPlayers && (
          <div className="info-message">
            <p>Waiting for Owner to continue</p>
          </div>
        )}
      </div>
      <div className="table">
        <Chair
          chairPosition="top"
          playerName={data.players[topPlayerIdx].name}
          lastPlayedCard={data.lastPlayedCards[topPlayerIdx]}
          currentPlayer={data.currentPlayer === topPlayerIdx}
          winningPlayer={data.players[topPlayerIdx].id === data.winningPlayerId}
          bodyColor={data.players[topPlayerIdx].bodyColor}
        />
        <Chair
          chairPosition="left"
          playerName={data.players[leftPlayerIdx].name}
          lastPlayedCard={data.lastPlayedCards[leftPlayerIdx]}
          currentPlayer={data.currentPlayer === leftPlayerIdx}
          winningPlayer={
            data.players[leftPlayerIdx].id === data.winningPlayerId
          }
          bodyColor={data.players[leftPlayerIdx].bodyColor}
        />
        <Chair
          chairPosition="right"
          playerName={data.players[rightPlayerIdx].name}
          lastPlayedCard={data.lastPlayedCards[rightPlayerIdx]}
          currentPlayer={data.currentPlayer === rightPlayerIdx}
          winningPlayer={
            data.players[rightPlayerIdx].id === data.winningPlayerId
          }
          bodyColor={data.players[rightPlayerIdx].bodyColor}
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
      {playerHasDisconnected && (
        <div className="disconnectPopup">
          <h3>A Player has Disconnected</h3>
          <p>Game is terminating</p>
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
      {showEndGameResults && !showResults && (
        <EndGameResultsPopup
          onClose={handleCloseEndGameResults}
          teamWonRound={data.teamWonRound}
          winningTeamPoints={data.winningTeamPoints}
          finalStakeCount={data.finalStakeCount}
          teamAStakeCount={data.teamAStakeCount}
          teamBStakeCount={data.teamBStakeCount}
        />
      )}
      {stakesReached && !showEndGameResults && (
        <StakesReachedPopup
          onClose={handleStakesReached}
          winningTeam={whoWon()}
          winningStakeCount={winningStakeCount()}
          finalStakeCount={data.finalStakeCount}
        />
      )}
      {playAgain && (
        <PlayAgainPopup onPlay={handlePlayerStays} onLeave={handleLeave} />
      )}
      {disconnectRequest && (
        <DisconnectPopup
          onResume={handleResume}
          onLeave={handleLeave}
          isOwner={isOwner}
          gameIsInProgress={data.gameInProgress}
        />
      )}
    </div>
  );
}
