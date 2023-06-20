import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/inicial-page.css';
import 'bootstrap/dist/css/bootstrap.min.css';

export function InitialPage() {
  const [tableID, setTableID] = useState<string>();
  const navigate = useNavigate();
  console.log(tableID);

  const handleCreateTable = () => {
    const currentDate = new Date();
    const randomNum = Math.floor(Math.random() * 1000000);
    const newTableID = currentDate.toISOString() + '_' + randomNum.toString();
    createTable(newTableID);
    navigate(`/table/${newTableID}`);
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
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/table')}
            >
              JOIN GAME
            </button>
          </div>
          <div className="mt-6 separator"></div>
          <h3 className="mt-6">CREATE GAME</h3>
          <p>
            Create your own game of Sedma and invite your friends to play with
            you. Whether it's a casual gathering or a competitive showdown, set
            the rules and enjoy the thrill of playing Sedma. Simply click the
            "Click to Create Game" button below to get started.
          </p>
          <button className="mt-3 btn btn-primary">Click to Create Game</button>
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
