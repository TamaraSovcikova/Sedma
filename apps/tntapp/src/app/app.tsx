
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { InitialPage } from './pages/initial-page';
import { LobbyPage } from './pages/lobby-page';
import { TablePage } from './pages/table-page';

const router = createBrowserRouter([
  {
    path: '/',
    element: <InitialPage />,
  },
  {
    path: '/lobby',
    element: <LobbyPage />,
  },
  {
    path: '/table/:id',
    element: <TablePage />,
  },
]);
=======
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
  const d: Card[] = [];
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
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
