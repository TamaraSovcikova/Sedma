import { useState } from 'react';
import { Table } from './components/table';
import { Card, Player, Table as TableType } from './types';
import { getGlobal } from './global';

function createPlayer(name: string): Player {
  return {
    name,
    hand: [],
  };
}

function createTable(): TableType {
  const deck: Card[] = [];
  const suits: Card['suit'][] = ['heart', 'acorn', 'leaf', 'bell'];
  const faces: Card['face'][] = [
    'seven',
    'eight',
    'nine',
    'ten',
    'lower',
    'upper',
    'king',
    'ace',
  ];
  for (const suit of suits) {
    for (const face of faces) {
      deck.push({ suit, face });
    }
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    const temp = deck[i];
    deck[i] = deck[j];
    deck[j] = temp;
  }

  return {
    players: [
      createPlayer('Player 1'),
      createPlayer('Player 2'),
      createPlayer('Player 3'),
      createPlayer('Player 4'),
    ],
    discard: [],
    deck: deck,
  };
}

export function App() {
  const [table, setTable] = useState<TableType>(createTable());
  const [message, setMessage] = useState<string>();
  const [currentPlayer, setCurrentPlayer] = useState<number>(0);

  const handOutCard = () => {
    setTable((table) => {
      const newTable = { ...table };
      for (const player of newTable.players) {
        while (player.hand.length < 4 && newTable.deck.length > 0) {
          const c = newTable.deck.pop();
          if (c) {
            player.hand.push(c);
          }
        }
      }
      return newTable;
    });
  };

  const handlePlayCard = (player: Player, card: Card) => {
    const newTable = { ...table };
    player.hand = player.hand.filter((c) => c !== card);
    newTable.discard.push(card);

    setTable(newTable);
    setCurrentPlayer((currentPlayer + 1) % table.players.length);
    postData(getGlobal().tableUrl, card);
  };

  const handleServer = async () => {
    const data = await fetchData(getGlobal().serverUrl);
    setMessage(data.message);
    console.log(data);
  };

  return (
    <div>
      <Table
        table={table}
        playCard={handlePlayCard}
        currentPlayer={currentPlayer}
        handOutCard={handOutCard}
      />
      <button onClick={handleServer}>Server</button>
      <p>{message}</p>
    </div>
  );
}

async function fetchData(url: RequestInfo | URL) {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}
async function postData(url: string, data: any) {
  const response = await fetch(url, {
    method: 'POST',
    headers: [['Content-Type', 'application/json']],
    body: JSON.stringify(data),
  });
  const responseData = await response.json();
  return responseData;
}

export default App;
