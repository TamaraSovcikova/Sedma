import { randomUUID } from 'crypto';
import { Card } from './card';

export class Player {
  name: string;
  onHand: Card[] = [];
  lastPlayedCard?: Card;
  id: string;
  cardsWon: Card[] = [];
  collectedPoints = 0;
  team: string;

  constructor(name: string) {
    this.name = name;
    this.id = randomUUID();
  }

  public getName() {
    return this.name;
  }

  //remmember that i changed it from collected Points
  public totalCollectedPoints(): void {
    this.cardsWon.forEach((c) => {
      this.collectedPoints += c.points;
    });
  }

  public haveCards(): boolean {
    return this.onHand.length > 0;
  }

  public collectWonCards(playedCards: Card[]): void {
    this.cardsWon.push(...playedCards);
  }

  public playerNeedsCards(): boolean {
    return this.onHand.length < 4;
  }

  public getCard(pile: Card[]): void {
    for (let i = 0; i < 4 - this.onHand.length; i++) {
      if (pile.length > 0) {
        this.onHand.push(pile[0]);
        pile.shift();
      } else {
        break;
      }
    }
  }
}
