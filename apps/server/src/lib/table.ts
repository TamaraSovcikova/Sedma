import { Card, Player, Table } from "./types";

function createPlayer(name: string): Player {
  return {
    name,
    hand: [],
  };
}
export function createTable(): Table {
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
    id: '111',
  }
}


