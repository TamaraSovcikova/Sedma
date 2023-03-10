export interface Card {
  suit: 'spades' | 'hearts' | 'diamonds' | 'clubs';
  face: 'seven' | 'eight' | 'nine' | 'ten' | 'jack' | 'queen' | 'king' | 'ace';
}

/**
 * Hrac a jeho karty
 */
export interface Player {
  name: string;
  hand: Card[];
}

export interface Table {
  /**
   * Hraci ktory su na stole
   */
  players: Player[];
  /**
   * Karty ktore su na stole
   */
  deck: Card[];
  /** Karty ktore boli hrane */
  discard: Card[];
}
