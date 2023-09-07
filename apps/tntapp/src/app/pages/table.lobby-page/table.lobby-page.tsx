import React, { useEffect, useState } from 'react';
import '../../styles/table.lobby-page.css';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchData, postData } from '../../lib/api';
import { getServerUrl } from '../../global';
import { useAuth } from '../../components/auth/auth-context';

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

  return (
    <div className="lobby-container">
      <div className="lobby-info">
        <h2 className="lobby-header">Welcome to a game of Sedma</h2>
        <p>
          Please enter your name and choose a seat you wish to be seated at.
          (PS. Players opposite each other will be together in a team)
        </p>
      </div>
      <div className="lobby-setting-params">
        <label id="lobby-label">
          Username:
          <input
            id="username-input"
            type="text"
            name="username"
            value={username}
            onChange={handleUsernameChange}
          />
        </label>
        <div className="teams-container">
          <Team
            teamName="Team A"
            seats={[seats[0], seats[2]]}
            selectedSeatId={selectedSeatId}
            onSeatClick={handleSeatClick}
          />
          <Team
            teamName="Team B"
            seats={[seats[1], seats[3]]}
            selectedSeatId={selectedSeatId}
            onSeatClick={handleSeatClick}
          />
        </div>
      </div>
      <button className="lobby-button" onClick={handleContinue}>
        Continue
      </button>
    </div>
  );
}
