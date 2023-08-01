import { Card, Player, Table as TableType } from './types';
import AppRouter from './routes/router';

function createPlayer(name: string): Player {
  return {
    name,
    hand: [],
  };
}

function createTable(): TableType {
  const d: Card[] = [];
  const suits: Card['suit'][] = ['heart', 'leaf', 'bell', 'acorn'];
  const faces: Card['face'][] = [
    'seven',
    'eight',
    'nine',
    'ten',
    'king',
    'upper',
    'lower',
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
  return (
    <div>
      <AppRouter />
    </div>
  );
}

export default App;
