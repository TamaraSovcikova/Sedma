import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/inicial-page.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { postData } from '../../lib/api';
import { getServerUrl } from '../../global';
import { useAuth } from '../../components/auth/auth-context';

export function InitialPage() {
  const [tableID, setTableID] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const { token, logout, setToken } = useAuth();
  const navigate = useNavigate();

  const handleCreateTable = () => {
    window.scrollTo(0, 0);
    postData(getServerUrl().newtableUrl, {}, token).then((id) =>
      navigate(`/table/lobby/${id}/?create=1`)
    );
  };

  const joinGame = async () => {
    try {
      const response = await fetch(getServerUrl().exitTableUrl(tableID));
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

  const startSinglePlayer = () => {
    postData(getServerUrl().singlePlayerTableUrl, { name }, token).then(
      ({ tableId, playerId }) => {
        setToken(playerId);
        navigate(`/table/${tableId}`);
      }
    );
  };
  const isPlayingOnComputer = () => {
    const screenWidth =
      window.innerWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth;

    const computerScreenWidthThreshold = 768;
    return screenWidth >= computerScreenWidthThreshold;
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
          {token && (
            <button className="btn btn-secondary" onClick={logout}>
              Exit previous game
            </button>
          )}
          <h1 className="mt-12">SEDMA</h1>
          <h5 className="mt-1">Welcome to the world of Sedma!</h5>
          <p>
            Joining a game is simple. If you have been invited to play by
            someone, enter their game ID in the input field below and click
            "JOIN GAME".
          </p>
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
          <div className="mt-5 separator"></div>
          <h3 className="mt-5">CREATE GAME</h3>
          <p>
            Be the one to create a game to invite your friends to. Whether it's
            a casual gathering or a competitive showdown, set the rules and
            enjoy the thrill of playing Sedma. Simply click the "Click to Create
            Game" button below to get started.
          </p>
          <button
            className="mt-3 btn btn-primary createGameButton"
            onClick={handleCreateTable}
          >
            Click to Create Game
          </button>
          <h3 className="mt-5">SINGLEPLAYER MODE</h3>
          <p>
            In case you want to play a relaxing game on your own, feel free to
            enter your player's name and get ready to play!
          </p>
          <div className="input-group mt-5 mb-3">
            <input
              className="form-control"
              placeholder="Enter Name"
              value={name}
              maxLength={11}
              onChange={(e) => setName(e.target.value)}
            />
            <button className="btn btn-secondary" onClick={startSinglePlayer}>
              SINGLEPLAYER GAME
            </button>
          </div>
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
