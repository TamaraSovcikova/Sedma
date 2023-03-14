export interface Card {
  suit: 'heart' | 'leaf' | 'acorn' | 'bell';
  face: 'seven' | 'eight' | 'nine' | 'ten' | 'lower' | 'upper' | 'king' | 'ace';
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
