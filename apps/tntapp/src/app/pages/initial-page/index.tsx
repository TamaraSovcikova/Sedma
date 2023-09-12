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
    postData(getServerUrl().newtableUrl, {}, token).then((id) =>
      navigate(`/table/lobby/${id}`)
    );
  };

  const joinGame = () => {
    navigate(`/table/lobby/${tableID}`);
  };

  const startSinglePlayer = () => {
    postData(getServerUrl().singlePlayerTableUrl, { name }, token).then(
      ({ tableId, playerId }) => {
        setToken(playerId);
        navigate(`/table/${tableId}`);
      }
    );
  };

  return (
    <div className="container p-0">
      <div className="row mt-4">
        <div className="col align-self-start">
          <h4 className="mt-2">SEDMA</h4>
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
            Joining a game of Sedma is simple. If you have been invited to play
            by someone, enter their game ID in the input field below and click
            "JOIN GAME". It's a great way to test your skills and have fun
            together!
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
          <div className="mt-6 separator"></div>
          <h3 className="mt-6">CREATE GAME</h3>
          <p>
            Create your own game of Sedma and invite your friends to play with
            you. Whether it's a casual gathering or a competitive showdown, set
            the rules and enjoy the thrill of playing Sedma. Simply click the
            "Click to Create Game" button below to get started.
          </p>
          <button className="mt-3 btn btn-primary" onClick={handleCreateTable}>
            Click to Create Game
          </button>
          <h2>SinglePlayerMode</h2>
          <div className="input-group mt-5 mb-3">
            <input
              className="form-control"
              placeholder="Enter Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button className="btn btn-secondary" onClick={startSinglePlayer}>
              START SINGLEPLAYER GAME
            </button>
          </div>
        </div>
        <div className="col-lg-4">
          <img
            src="https://www.thoughtco.com/thmb/Qx4zhTIddLwa9jXfelCbnSuhbkM=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/close-up-of-cards-on-white-background-767988479-5c4bd7bb4cedfd0001ddb36e.jpg"
            alt="Card close-up"
            className="mb-5"
          />
          <img
            src="https://images.ctfassets.net/sm166qdr1jca/2B0MXRrvv3ToeRH38QbhKg/5d52594452841f338feba538e8ab5c1f/Website_Red_Riderback.jpg"
            alt="Cards"
            className="mt-5"
          />
        </div>
      </div>
      <div className="extra-space"></div>
    </div>
  );
}
