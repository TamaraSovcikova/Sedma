import React, { useEffect, useRef, useState } from 'react';
import '../../styles/table.lobby-page.css';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchData, postData } from '../../lib/api';
import { getServerUrl } from '../../global';
import { useAuth } from '../../components/auth/auth-context';

//TODO: ADD Rules explanation and explanation of the sunglasses and crown
interface Seat {
  id: number;
  name: string;
  taken: boolean;
}

interface TeamProps {
  teamName: string;
  seats: Seat[];
  selectedSeatId: number | null;
  onSeatClick: (seatId: number) => void;
}

const Team: React.FC<TeamProps> = ({
  teamName,
  seats,
  selectedSeatId,
  onSeatClick,
}) => (
  <div className="team">
    <h3 className="lobby-sub-header">{teamName}</h3>
    <div className="row">
      {seats.map((seat) => (
        <div
          key={seat.id}
          className={`seat ${seat.taken ? 'taken' : ''} ${
            selectedSeatId === seat.id ? 'selected' : ''
          }`}
          onClick={() => !seat.taken && onSeatClick(seat.id)}
        >
          {seat.taken ? seat.name : 'Available'}
        </div>
      ))}
    </div>
  </div>
);

export function LobbyPage() {
  const params = useParams();
  const navigate = useNavigate();
  const id = params.id ?? '0';
  const { token, setToken } = useAuth();
  const [newtoken, setNewToken] = useState<string>();

  useEffect(() => {
    console.log('lobby page token: ', token);
    if (token) {
      navigate(`/table/${id}`);
    }
  }, [navigate, id, token]);

  useEffect(() => {
    if (id)
      fetchData(getServerUrl().lobbyUrl(id), token)
        .then((d: string[]) => {
          const seats = d.map((n, idx) => {
            const seat = {
              id: idx + 1,
              name: n ? n : '',
              taken: n ? true : false,
            };
            return seat;
          });

          setSeats(seats);
        })
        .catch((err) => console.log('Table does not exist', err));
  }, [id, token]);

  const [username, setUsername] = useState('');
  const [seats, setSeats] = useState<Seat[]>([
    { id: 1, name: '', taken: false },
    { id: 2, name: '', taken: false },
    { id: 3, name: '', taken: false },
    { id: 4, name: '', taken: false },
  ]);
  const [selectedSeatId, setSelectedSeatId] = useState<number | null>(null);

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handleSeatClick = async (seatId: number) => {
    //first has to check if not taken , then clear the previous or at least try
    console.log(seatId);
    if (!seats[seatId - 1].taken)
      if (selectedSeatId !== null) {
        setSeatStatus(selectedSeatId, { name: '', taken: false });
      }

    setSeatStatus(seatId, { name: username, taken: true });
    setSelectedSeatId(seatId);

    const result = await postData(
      getServerUrl().lobbyUrl(id),
      { username, seatId },
      token
    );
    console.log('result: ', result);
    console.log('Sending over the player', username, seatId);

    setNewToken(result.id);
  };

  const setSeatStatus = (
    seatId: number,
    status: { name: string; taken: boolean }
  ) => {
    setSeats((prevSeats) =>
      prevSeats.map((seat) =>
        seat.id === seatId ? { ...seat, ...status } : seat
      )
    );
  };

  const handleContinue = () => {
    console.log(`${username} just chose a seat and is ready to play`);
    setToken(newtoken);
  };
  const handleReturn = () => {
    navigate('/');
  };

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

      alert('Text copied to clipboard!');
    } else {
      alert('ERROR NO ID');
    }
  };

  return (
    <div className="container lobbyPageContainer">
      <button className="btn btn-secondary returnButton" onClick={handleReturn}>
        <i
          className="fas fa-arrow-left"
          style={{ fontSize: '20px', color: 'black' }}
        ></i>
      </button>
      <div className="row justify-content-center mt-5">
        <div className="col-md-8">
          <h2 className="lobby-header text-center">JOIN A GAME OF SEDMA</h2>
        </div>
        <div className="row justify-content-center mt-4">
          <div className="col-md-12">
            <p className="tableID-text">
              Your Unique Table ID, send it to your friends to let them join!
            </p>
            <div className="input-group mt-5 mb-3">
              <input
                id="table-id-input"
                type="text"
                className="form-control"
                name="Table ID"
                placeholder="Table ID"
                value={id}
                readOnly
              />
              <button className="btn btn-secondary m-0" onClick={handleCopy}>
                Copy
              </button>
            </div>
          </div>
        </div>
        <div className="mt-5 separator"></div>
      </div>
      <div className="row justify-content-center mt-4">
        <div className="col-md-12">
          <div className="form-group">
            <label style={{ fontSize: '20px' }} htmlFor="username-input">
              ENTER USERNAME:
            </label>
            <input
              id="username-input"
              type="text"
              className="form-control"
              name="Username"
              placeholder="Username"
              maxLength={11}
              value={username}
              onChange={handleUsernameChange}
            />
          </div>
        </div>
      </div>
      <p className="teamInfo">
        After entering your username, please select the seat you want to be
        seated at whilst simultaneously choosing your teamate. Pick any of the
        'Available' slots.
      </p>
      <div className="row justify-content-center mt-4">
        <div className="col-md-8">
          <div className="row teams-container">
            <div className="col-md-6 team">
              <Team
                teamName="Team A"
                seats={[seats[0], seats[2]]}
                selectedSeatId={selectedSeatId}
                onSeatClick={handleSeatClick}
              />
            </div>
            <div className="col-md-6 team">
              <Team
                teamName="Team B"
                seats={[seats[1], seats[3]]}
                selectedSeatId={selectedSeatId}
                onSeatClick={handleSeatClick}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="row justify-content-center">
        <div className="col-md-12 mb-5">
          <button
            className="btn btn-primary lobby-button"
            onClick={handleContinue}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
