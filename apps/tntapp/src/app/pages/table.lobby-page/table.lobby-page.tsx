import React, { useEffect, useState } from 'react';
import '../../styles/table.lobby-page.css';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { fetchData, postData } from '../../lib/api';
import { getServerUrl } from '../../global';
import { useAuth } from '../../components/auth/auth-context';
import { Team } from './components/team';
import { CustomizationBox } from './components/customization-box';

export interface Seat {
  id: number;
  name: string;
  taken: boolean;
}

export function LobbyPage() {
  const params = useParams();
  const navigate = useNavigate();
  const id = params.id ?? '0';
  const { token, setToken, setTableId } = useAuth();
  const [newtoken, setNewToken] = useState<string>();
  const [isCreatingTable, setIsCreatingTable] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(true);
  const [stakeLimit, setStakeLimit] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  const [query] = useSearchParams();

  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    const create = query.get('create');
    if (create === '1') setIsCreatingTable(true);
  }, [query]);

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
  let usernameInputTimer: string | number | NodeJS.Timeout | undefined;

  const handleUsernameChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newUsername = event.target.value;
    console.log('handling username change');

    try {
      if (!username) {
        setUsername(newUsername);
      }

      if (selectedSeatId) {
        console.log(
          'entered, because has selected seat: ',
          selectedSeatId,
          'past username: ',
          username
        );

        await postData(
          getServerUrl().deletePlayerUrl(id),
          { oldUsername: username },
          token
        );

        setSeatStatus(selectedSeatId, { name: '', taken: false });
        setSelectedSeatId(null);
      }

      setUsername(newUsername);
    } catch (error) {
      console.error('Error during handleUsernameChange:', error);
    }

    // Clear the previous timer if it exists
    if (usernameInputTimer) {
      clearTimeout(usernameInputTimer);
    }

    // Set a new timer to send the request after 2 seconds
    usernameInputTimer = setTimeout(async () => {
      if (!isCreatingTable) {
        const response = await postData(
          getServerUrl().checkUsernameUrl(id),
          {
            username: newUsername,
            selectedSeatId,
          },
          token
        );

        if (response.message === 'Username is free') {
          console.log('This username is available');
          setIsUsernameAvailable(true);
        } else if (response.message === 'Username is taken') {
          console.log('Username is taken');
          setIsUsernameAvailable(false);
        } else {
          console.log('An error occurred:', response);
        }
      }
    }, 1000);
  };

  const handleSeatClick = async (seatId: number) => {
    //first has to check if not taken , then clear the previous or at least try
    if (!username || !isUsernameAvailable) return;
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

  useEffect(() => {
    setIsFormValid(
      username.trim() !== '' &&
        selectedSeatId !== null &&
        (!isCreatingTable || (isCreatingTable && stakeLimit !== ''))
    );
  }, [username, selectedSeatId, stakeLimit, isCreatingTable]);

  const handleContinue = async () => {
    if (isFormValid) {
      console.log(`${username} just chose a seat and is ready to play`);

      postData(
        getServerUrl().tabledata(id),
        { isCreatingTable, username, stakeLimit, selectedColor },
        token
      );

      setToken(newtoken);
      setTableId(id);
    }
  };

  const handleStakeLimitChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newStakeLimit = event.target.value;
    setStakeLimit(newStakeLimit);
  };

  const handleReturn = () => {
    navigate('/');
  };

  function shareViaWhatsApp(tableId: string) {
    const message = `Join our Sedma game! Table ID: ${tableId}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }

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

  const handleColorChange = (colorId: string) => {
    setSelectedColor(colorId);
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
        <div className="mt-5 separator"></div>
      </div>
      <div className="row justify-content-center mt-4">
        <div className="col-md-12">
          <div className="form-group">
            <div className="username-input-container">
              <label className="username-label" htmlFor="username-input">
                ENTER USERNAME:
              </label>
              <input
                id="username-input"
                type="text"
                className={`form-control username-input ${
                  !isUsernameAvailable ? 'username-input-error' : ''
                }`}
                name="Username"
                placeholder="Username"
                maxLength={11}
                value={username}
                onChange={handleUsernameChange}
                required
              />
            </div>
            {isUsernameAvailable === false && (
              <span style={{ color: 'red' }}>Username is already taken</span>
            )}
          </div>
        </div>
      </div>
      <CustomizationBox
        selectedColor={selectedColor}
        onColorChange={handleColorChange}
      />
      <p className="teamInfo">
        After entering your username and customising your character, please
        select the seat you want to be seated at whilst simultaneously choosing
        your teamate. Pick any of the 'Available' slots.
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
      {isCreatingTable && (
        <div className="stake-input-container mb-5">
          <label className="stake-label" htmlFor="username-input">
            GOAL STAKE COUNT:
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
      )}
      <div className="row justify-content-center">
        <div className="col-md-12 mb-5">
          <button
            className="btn lobby-button"
            onClick={handleContinue}
            disabled={!isFormValid}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
