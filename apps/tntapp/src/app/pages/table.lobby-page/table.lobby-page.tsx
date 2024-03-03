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
  const [username, setUsername] = useState('');
  const [seats, setSeats] = useState<Seat[]>([
    { id: 1, name: '', taken: false },
    { id: 2, name: '', taken: false },
    { id: 3, name: '', taken: false },
    { id: 4, name: '', taken: false },
  ]);
  const [selectedSeatId, setSelectedSeatId] = useState<number | null>(null);
  let usernameInputTimer: string | number | NodeJS.Timeout | undefined;

  //Checking the query parameters to check if player is in creating mode
  useEffect(() => {
    const create = query.get('create');
    if (create === '1') setIsCreatingTable(true);
  }, [query]);

  //If player already has a token, it should connect them directly to the game, skipping the lobby page
  useEffect(() => {
    console.log('lobby page token: ', token);
    if (token) {
      navigate(`/table/${id}`);
    }
  }, [navigate, id, token]);

  //Maping the seating arrangement based on data from server
  useEffect(() => {
    let mounted = true;
    if (!id) return;

    const fetchDataAndUpdateSeats = async () => {
      try {
        const data = await fetchData(getServerUrl().lobbyUrl(id), token);
        const seats = data.map((n: string, idx: number) => ({
          id: idx + 1,
          name: n || '',
          taken: !!n,
        }));
        if (mounted) {
          setSeats(seats);
        }
      } catch (err) {
        console.log('Error fetching data:', err);
      }
    };

    if (id) {
      fetchDataAndUpdateSeats();
      //Making sure to update the page, checking for any changes by paking a poll every 3 seconds
      const intervalId = setInterval(fetchDataAndUpdateSeats, 3000);

      return () => {
        // Cleanup interval on component unmount
        clearInterval(intervalId);
        mounted = false;
      };
    }

    return () => {
      mounted = false;
    };
  }, [id, token]);

  const handleUsernameChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newUsername = event.target.value;
    console.log('handling username change');

    try {
      if (!username) {
        // Setting the new username if the previous username was empty
        setUsername(newUsername);
      }

      if (selectedSeatId) {
        // Removing the player from the selected seat if it's already taken
        await postData(
          getServerUrl().deletePlayerUrl(id),
          { oldUsername: username },
          token
        );

        // Updating the seat status and resetting the selected seat
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
    // Check if username is available and not empty
    if (!username || !isUsernameAvailable) return;

    // If the seat is not taken, clear the previously selected seat
    if (!seats[seatId - 1].taken)
      if (selectedSeatId !== null) {
        setSeatStatus(selectedSeatId, { name: '', taken: false });
      }

    // Set the status of the clicked seat and update the selected seat ID
    setSeatStatus(seatId, { name: username, taken: true });
    setSelectedSeatId(seatId);

    // Send player data to the server
    const result = await postData(
      getServerUrl().lobbyUrl(id),
      { username, seatId },
      token
    );

    console.log('Sending over the player', username, seatId);

    // Update token with the new token received from the server
    setNewToken(result.id);
  };

  const setSeatStatus = (
    seatId: number,
    status: { name: string; taken: boolean }
  ) => {
    // Update the seats array using the previous state
    setSeats((prevSeats) =>
      prevSeats.map((seat) =>
        // If the seat ID matches the given seatId, update its status; otherwise, keep the seat unchanged
        seat.id === seatId ? { ...seat, ...status } : seat
      )
    );
  };

  useEffect(() => {
    // Check if username is not empty, a seat is selected, and stake limit is provided if creating a table
    setIsFormValid(
      username.trim() !== '' &&
        selectedSeatId !== null &&
        (!isCreatingTable || (isCreatingTable && stakeLimit !== ''))
    );
  }, [username, selectedSeatId, stakeLimit, isCreatingTable]);

  const handleContinue = async () => {
    // Proceed only if the form is valid (all neccessary fields filled out)
    if (isFormValid) {
      // Send data to the server
      postData(
        getServerUrl().tabledata(id),
        { isCreatingTable, username, stakeLimit, selectedColor },
        token
      );

      // Update token and table ID
      setToken(newtoken);
      setTableId(id);
    }
  };

  // Handle change event when stake limit input value changes
  const handleStakeLimitChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newStakeLimit = event.target.value;
    setStakeLimit(newStakeLimit);
  };

  const handleReturn = () => {
    // If a table is being created, notify the server about leaving the lobby
    if (isCreatingTable) {
      fetchData(getServerUrl().leavingLobby(id), token);
    }
    // Navigate the user back to the landing page
    navigate('/');
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
        After selecting a username, select a seat and your teamate. Pick any of
        the 'Available' slots.
      </p>
      <div className="row justify-content-center mt-4">
        <div className="col-12">
          <div className="row teams-container">
            <div className="col-6 team">
              <Team
                teamName="Team A"
                seats={[seats[0], seats[2]]}
                selectedSeatId={selectedSeatId}
                onSeatClick={handleSeatClick}
              />
            </div>
            <div className="col-6 team">
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
