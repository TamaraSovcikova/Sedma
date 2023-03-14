export interface Card {
  suit: 'heart' | 'leaf' | 'acorn' | 'bell';
  face: 'seven' | 'eight' | 'nine' | 'ten' | 'lower' | 'upper' | 'king' | 'ace';
}

export interface Player {
  name: string;
  hand: Card[];
}

export interface Table {
  players: Player[];  
  deck: Card[];  
  discard: Card[];
}
