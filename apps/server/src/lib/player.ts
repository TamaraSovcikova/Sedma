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
  onHand: Card[] = []; // cards the player has on hand
  lastPlayedCard?: Card; // the last card the player played
  id: string;
  cardsWon: Card[] = []; //collection of the cards from the won deals
  collectedPoints = 0; // the points counted up from the cardsWon
  team: string;
  ws: ws.WebSocket | null = null; //websocket connection
  connected: boolean;
  isReadyToPlay: boolean; //symbolizes whether or not the player has a popup open
  bodyColor: string;
  /**measures the level of computer inteligence used.
   * 0 - human
   * 1 - stupid computer
   */
  autoplay: AutoPlay | null = null;

  constructor(name: string) {
    this.name = name;
    this.id = randomUUID(); // Generates a unique ID for the player
    this.bodyColor = 'black'; // Default body color
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
