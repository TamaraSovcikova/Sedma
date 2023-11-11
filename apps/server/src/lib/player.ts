import { randomUUID } from 'crypto';
import { Card } from './card';
import ws from 'ws';
import debugLog from 'debug';
import { Table } from './table';
import { MessageForcePlayerDisconnect } from '@tnt-react/ws-messages';

const debug = debugLog('table');
export type AutoPlay = (table: Table, playerIdx: number) => void;

export class Player {
  name: string;
  onHand: Card[] = [];
  lastPlayedCard?: Card;
  id: string;
  cardsWon: Card[] = [];
  collectedPoints = 0;
  team: string;
  ws: ws.WebSocket | null = null;
  connected: boolean;
  isReadyToPlay: boolean;
  bodyColor: string;
  /**measures the level of computer inteligence used.
   * 0 - human
   * 1 - stupid computer
   */
  autoplay: AutoPlay | null = null;

  constructor(name: string) {
    this.name = name;
    this.id = randomUUID();
    this.bodyColor = 'black';
  }

  public getName() {
    return this.name;
  }

  public setAutoPlay(autoplay: AutoPlay) {
    this.autoplay = autoplay;
  }

  public connectPlayer(ws: ws.WebSocket | null) {
    this.ws = ws;
    this.connected = true;
  }
  public disconnect() {
    this.connected = false;
    const message: MessageForcePlayerDisconnect = {
      type: 'forcePlayerDisconnect',
    };
    this.ws.send(JSON.stringify(message));
  }

  public haveCards(): boolean {
    return this.onHand.length > 0;
  }

  public collectWonCards(playedCards: Card[]): void {
    this.cardsWon.push(...playedCards);
    this.collectedPoints = this.cardsWon.reduce(
      (total, c) => (total += c.points),
      0
    );
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
