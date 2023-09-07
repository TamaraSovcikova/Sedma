type SuitType = 'heart' | 'leaf' | 'acorn' | 'bell';
type FaceType =
  | 'seven'
  | 'eight'
  | 'nine'
  | 'ten'
  | 'lower'
  | 'upper'
  | 'king'
  | 'ace';

export class Card {
  public suit: SuitType;
  public face: FaceType;
  public points: number;

  constructor(suit: SuitType, face: FaceType) {
    this.suit = suit;
    this.face = face;
    this.points = face == 'ace' || face == 'ten' ? 10 : 0;
  }
}
