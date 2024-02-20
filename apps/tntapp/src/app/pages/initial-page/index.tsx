import { ReactEventHandler, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/inicial-page.css';
import { postData } from '../../lib/api';
import { getServerUrl } from '../../global';
import { useAuth } from '../../components/auth/auth-context';

interface StatusMessageProps {
  message: string;
  onReturn: ReactEventHandler | null;
  onLeave: ReactEventHandler;
  returnColor?: string;
  leaveColor?: string;
}

export function StatusMessage({
  message,
  onReturn,
  onLeave,
  returnColor = 'darkgreen',
  leaveColor = 'gray',
}: StatusMessageProps) {
  return (
    <div>
      <p style={{ color: 'darkred' }}>{message}</p>
      {onReturn && (
        <button
          className="btn btn-secondary"
          style={{ background: returnColor, marginRight: '10px' }}
          onClick={onReturn}
        >
          Return to Game
        </button>
      )}
      <button
        className="btn btn-secondary"
        style={{ background: leaveColor }}
        onClick={onLeave}
      >
        Leave Game
      </button>
    </div>
  );
}

export function InitialPage() {
  const { token, logout, setToken, tableId, setTableId } = useAuth();
  const [tableID, setTableID] = useState('');
  const [error, setError] = useState(false);
  const [name, setName] = useState('');
  const [stakeLimit, setStakeLimit] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const [query] = useSearchParams();

  const navigate = useNavigate();

  useEffect(() => {
    // Parse tableId from URL query parameter
    const paramTableId = query.get('tableId');
    if (paramTableId) {
      setTableID(paramTableId);
    }
  }, [query]);

  useEffect(() => {
    setIsFormValid(name.trim() !== '' && stakeLimit !== '');
  }, [name, stakeLimit]);

  const handleGameReturn = () => {
    navigate(`/table/${tableId}`);
  };

  const handleStakeLimitChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newStakeLimit = event.target.value;
    setStakeLimit(newStakeLimit);
  };

  const joinGame = async () => {
    try {
      const response = await fetch(
        getServerUrl().checkIfTableExistsUrl(tableID)
      );
      if (response.status === 200) {
        setError(false);
        window.scrollTo(0, 0);
        navigate(`/table/lobby/${tableID}`);
      } else if (response.status === 404) {
        console.log('this table with id:', tableID, 'was not found');
        setError(true);
      } else {
        setError(true);
      }
    } catch (error) {
      console.error('Error:', error);
      setError(true);
    }
  };

  const logOutOfGame = () => {
    logout();

    if (tableId)
      postData(
        getServerUrl().playerLogOutUrl(tableId),
        {
          token: token,
        },
        token
      );
    console.log('handleLoggout');
  };

  const startSinglePlayer = () => {
    if (isFormValid) {
      postData(
        getServerUrl().singlePlayerTableUrl,
        { name, stakeLimit },
        token
      ).then(({ tableId, playerId }) => {
        setToken(playerId);
        setTableId(tableId);
        navigate(`/table/${tableId}`);
      });
    }
  };

  const handleCreateTable = () => {
    window.scrollTo(0, 0);
    postData(getServerUrl().newtableUrl, {}, token).then((id) =>
      navigate(`/table/lobby/${id}/?create=1`)
    );
  };

  const handleRulesButton = () => {
    window.scrollTo(0, 0);
    navigate('/rules');
  };

  const isPlayingOnComputer = () => {
    const screenWidth =
      window.innerWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth;

    const screenWidthThreshold = 768;
    return screenWidth >= screenWidthThreshold;
  };

  return (
    <div className="container p-0">
      <div className="row mt-4">
        <div className="col align-self-start">
          <h4>SEDMA</h4>
          <div className="linebreak"></div>
        </div>
      </div>
      <div className="row">
        <div className="col-lg-4 align-self-start">
          <h1 className="mt-12">SEDMA</h1>
          <h5 className="mt-1">Welcome to the world of Sedma!</h5>
          <p>
            Joining a game is simple. If you have been invited to play by
            someone, enter their game ID in the input field below and click
            "JOIN GAME".
          </p>
          {token && tableId && (
            <StatusMessage
              message="To Join a new game, log out first or rejoin by pressing button"
              onReturn={handleGameReturn}
              onLeave={logOutOfGame}
            />
          )}
          {!token && (
            <div>
              <div className="input-group mt-5 mb-3">
                <input
                  className="form-control"
                  placeholder="Enter ID"
                  value={tableID}
                  onChange={(e) => setTableID(e.target.value)}
                />
                <button className="btn btn-secondary" onClick={joinGame}>
                  JOIN GAME
                </button>
              </div>
              {error && (
                <p className="text-danger">
                  The entered table ID does not exist. Please try again.
                </p>
              )}
            </div>
          )}
          <div className="mt-5 separator"></div>
          <h3 className="mt-5">CREATE GAME</h3>
          <p>
            Be the one to create a game to invite your friends to. Whether it's
            a casual gathering or a competitive showdown, set the rules and
            enjoy the thrill of playing Sedma. Simply click the "Click to Create
            Game" button below to get started.
          </p>
          {!token && (
            <button
              className="mt-3 btn btn-primary createGameButton"
              onClick={handleCreateTable}
            >
              Click to Create Game
            </button>
          )}
          {token && tableId && (
            <StatusMessage
              message="To Create A Game, You must Log out First!!"
              onLeave={logOutOfGame}
              onReturn={null}
            />
          )}
          <h3 className="mt-5">SINGLEPLAYER MODE</h3>
          <p>
            In case you want to play a relaxing game on your own, feel free to
            enter your player's name and stake count to reach and get ready to
            play!
          </p>
          {!token && (
            <div>
              <div className="stake-input-container mb-1">
                <label className="stake-label" htmlFor="username-input">
                  Set a goal stake count:
                </label>
                <input
                  type="number"
                  className="form-control stake-input"
                  name="stakes count"
                  placeholder="Stake Count"
                  value={stakeLimit}
                  onChange={handleStakeLimitChange}
                  required
                />
              </div>
              <div className="input-group mt-1 mb-3">
                <input
                  className="form-control"
                  placeholder="Enter Name"
                  value={name}
                  maxLength={11}
                  onChange={(e) => setName(e.target.value)}
                />
                <button
                  className="btn btn-secondary"
                  disabled={!isFormValid}
                  onClick={startSinglePlayer}
                >
                  SINGLEPLAYER GAME
                </button>
              </div>
            </div>
          )}
          {token && tableId && (
            <StatusMessage
              message="To Play SinglePlayer, You must Log out First!"
              onLeave={logOutOfGame}
              onReturn={null}
            />
          )}

          <h3 className="mt-5">RULES</h3>
          <p>
            There are many variations of Sedma out there, so click here to find
            out how we like to play the game!
          </p>
          <button className="btn btn-secondary" onClick={handleRulesButton}>
            <i className="fas fa-book" />
          </button>
        </div>
        {isPlayingOnComputer() && (
          <div className="col-lg-4">
            <img
              src="https://dnes.top/wp-content/uploads/2020/04/kartove-hry-pre-dvoch.jpg"
              alt="Card close-up"
              className="inicialPageImg mb-5"
            />
            <img
              src="https://www.tifantex.cz/fotky112972/fotos/_vyr_1298orig.jpg"
              alt="Cards"
              className="inicialPageImg mt-5"
            />
          </div>
        )}
      </div>
      <div className="extra-space"></div>
    </div>
  );
}
