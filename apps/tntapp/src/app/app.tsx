import { useState } from 'react';
import { Table } from './components/table';
import { Card, Player, Table as TableType } from './types';

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
  const [currentPlayer, setCurrentPlayer] = useState<number>(0);

  const handleTakeCard = (player: Player) => {
    setTable((table) => {
      const newTable = { ...table };
      const newPlayer = newTable.players.find((p) => p.name === player.name);
      if (newPlayer) {
        const c = newTable.deck.pop();
        if (c) {
          newPlayer.hand.push(c);
        }
      }
      return newTable;
    });
    setCurrentPlayer((currentPlayer + 1) % table.players.length);
  };

  const handlePlayCard = (player: Player, card: Card) => {
    const newTable = { ...table };
    player.hand = player.hand.filter((c) => c !== card);
    newTable.discard.push(card);

    setTable(newTable);
  };

  return (
    <div>
      <Table
        table={table}
        playCard={handlePlayCard}
        takeCard={handleTakeCard}
        currentPlayer={currentPlayer}
      />
    </div>
  );
}

export default App;
