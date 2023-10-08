import { FaceType, SuitType } from '@tnt-react/ws-messages';

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
