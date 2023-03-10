import { useState } from 'react';
import { ClickCounter } from './click-counter';
import { Table } from './components/table';
import { ShowOnlyEven } from './show-only-even';
import { Card, Player, Table as TableType } from './types';

function createPlayer(name: string): Player {
  return {
    name,
    hand: [],
  };
}

function createTable(): TableType {
  let d: Card[] = [];
  const suits: Card['suit'][] = ['spades', 'hearts', 'diamonds', 'clubs'];
  const faces: Card['face'][] = [
    'seven',
    'eight',
    'nine',
    'ten',
    'jack',
    'queen',
    'king',
    'ace',
  ];
  for (const suit of suits) {
    for (const face of faces) {
      d.push({ suit, face });
    }
  }

  return {
    players: [
      createPlayer('Player 1'),
      createPlayer('Player 2'),
      createPlayer('Player 3'),
      createPlayer('Player 4'),
    ],
    discard: [],
    deck: d,
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
        newPlayer.hand.push(newTable.deck.pop()!);
      }
      return newTable;
    });
    setCurrentPlayer((currentPlayer + 1) % table.players.length);
  };

  const handlePlayCard = (player: Player, card: Card) => {
    setTable((table) => {
      const newTable = { ...table };
      const newPlayer = newTable.players.find((p) => p.name === player.name);
      if (newPlayer) {
        newPlayer.hand = newPlayer.hand.filter((c) => c !== card);
        newTable.discard.push(card);
      }
      return newTable;
    });
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
