import { Player } from './player';
import { Card, FaceType, SuitType } from './card';
import { MessageTableData, TableData } from './wsServer';

import debugLog from 'debug';
import { table } from 'console';

const debug = debugLog('table');

export class Table {
  players: Player[];
  deck: Card[] = [];
  id: string;
  /** player who is currently winning the game */
  winningPlayer: number;
  /** person who won the last game /starts the round */
  leadPlayer = 0;
  /** the person whos turn it is */
  currentPlayer: number;
  discardPile: Card[] = [];
  cardToBeat: Card | null = null;
  teamAPoints: number;
  teamBPoints: number;
  deckDone: boolean;
  gameover: boolean;
  waitingForPlayers = true;
  ownerOfTable: Player = undefined;
  gameInProgress = false;
  leadingPlayerId: string;

  constructor(id: string) {
    const emptyPlayer = new Player('');
    this.players = [emptyPlayer, emptyPlayer, emptyPlayer, emptyPlayer];
    this.id = id;
  }

  public sendUpdates() {
    const playerList = this.players.map((p) => ({ name: p.name, id: p.id }));
    const lastPlayedCards = this.players.map((p) => p.lastPlayedCard);

    const debug2 = debug.extend('sendUpdates');
    for (const p of this.players) {
      const hand = p.onHand;
      const waitingForPlayers = this.playerCount() < 4;

      const data: TableData = {
        players: playerList,
        lastPlayedCards,
        hand,
        waitingForPlayers,
        currentPlayer: this.currentPlayer,
        ownerOfTableId: this.ownerOfTable.id,
        gameInProgress: this.gameInProgress,
        leadingPlayerId:
          this.players.length > 0 ? this.players[this.leadPlayer].id : '',
      };
      const messageData: MessageTableData = {
        data,
        type: 'tableData',
        tableId: this.id,
      };
      debug2('players data:', data, 'and player id: ', p.id);

      if (p.ws) p.ws.send(JSON.stringify(messageData));
    }
  }

  public createDeck(): Card[] {
    // Makes a deck of 32 cards
    const suits: SuitType[] = ['heart', 'leaf', 'bell', 'acorn'];
    const faces: FaceType[] = [
      'seven',
      'eight',
      'nine',
      'ten',
      'lower',
      'upper',
      'king',
      'ace',
    ];

    for (let i = 0; i < suits.length; i++) {
      for (let y = 0; y < faces.length; y++) {
        this.deck.push(new Card(suits[i], faces[y]));
      }
    }
    return this.deck;
  }

  public shuffleDeck(): Card[] {
    // Makes a new list which will hold the shuffled card
    this.deck.sort(() => Math.random() - 0.5);
    return this.deck;
  }

  public deckHasCards(): boolean {
    return this.deck.length > 0;
  }

  public handOutCards(): void {
    // Gives each player the amount of cards they are missing
    debug('going to hand out cards');
    for (let i = 0; i < this.players.length; i++) {
      const playerToGetCards = (i + this.leadPlayer) % this.players.length;

      if (this.deck.length > 4) {
        while (this.players[playerToGetCards].playerNeedsCards()) {
          if (this.deckHasCards()) {
            this.players[playerToGetCards].getCard(this.deck);
          } else {
            debug('no cards to give deck length more than 4');
            break;
          }
        }
      } else {
        if (this.players[playerToGetCards].playerNeedsCards()) {
          if (this.deckHasCards()) {
            this.players[playerToGetCards].getCard(this.deck);
          } else {
            debug('no cards to give less than 4');
            break;
          }
        }
      }
    }
    this.players.map((p) => debug(p.name, p.onHand));
  }

  public playCard(playerId: string, card: Card) {
    const player = this.players.find((p) => p.id === playerId);
    debug(player.name, 'is playing card: ', card);

    if (!player) {
      throw new Error('Player not found on the table');
    }
    if (this.players.indexOf(player) !== this.currentPlayer) {
      throw new Error('It is not your turn to play');
    }
    this.discardPile.push(card);
    const cardIdx = player.onHand.findIndex(
      (c) => c.face === card.face && c.suit === card.suit
    );
    player.onHand.splice(cardIdx, 1);
    player.lastPlayedCard = card;

    // Check if the card beats the current card to beat
    if (this.cardToBeat === null) {
      this.cardToBeat = card;
    } else {
      if (card.face === this.cardToBeat.face || card.face === 'seven') {
        this.winningPlayer = this.players.indexOf(player);
        debug(`${player.name} owns the pile`);
      }
    }

    this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
    this.sendUpdates();

    //checking if next player is an autoplayer and will play untill they arent one
    if (this.players[this.currentPlayer].autoplay) {
      setTimeout(() => {
        this.players[this.currentPlayer].autoplay(this, this.currentPlayer);
        debug('played AutoPlay for', this.players[this.currentPlayer].name);
        this.sendUpdates();
      }, 2000);
    }

    if (this.gameover) {
      debug('GAMEOVER');
      this.evaluateGame();
      this.showResults();
    }
  }

  public endRound() {
    // Calculate the winner of the round
    this.leadPlayer = this.winningPlayer;
    this.players[this.winningPlayer].collectWonCards(this.discardPile);
    this.discardPile = [];

    debug(`\nWinner of the Round: ${this.players[this.winningPlayer].name}`);

    if (!this.deckHasCards() && this.allCardsPlayed()) {
      this.gameover = true;
    } else {
      this.handOutCards();
    }
    this.cardToBeat = null;
  }

  public evaluateGame() {
    for (const player of this.players) {
      player.totalCollectedPoints();
    }

    if (this.players.length === 4) {
      for (let i = 0; i < 4; i++) {
        if (this.players[i].team === 'A')
          this.teamAPoints += this.players[i].collectedPoints;
        else this.teamBPoints += this.players[i].collectedPoints;
      }
    }
    debug('END, time to sum the points');
  }
  public playerCount(): number {
    const playerCount = this.players.reduce((total, element) => {
      if (!element.connected) return total;
      else return total + 1;
    }, 0);
    return playerCount;
  }
  public showResults() {
    if (this.players.length === 4) {
      if (this.teamAPoints > this.teamBPoints) {
        debug(`\nTeam A, Won this game: ${this.teamAPoints}!`);
      } else if (this.teamBPoints > this.teamAPoints) {
        debug(`\nTeam B, Won this game: ${this.teamAPoints}!`);
      } else {
        debug('\nThis game ended in a DRAW!');
      }
    }
  }

  public setUpGame(): void {
    debug('----A New Game Has Begun----');
    this.createDeck();
    this.shuffleDeck();
    this.currentPlayer = 0;
    this.gameInProgress = true;
    this.leadPlayer = this.currentPlayer;
    this.winningPlayer = this.currentPlayer;
    this.discardPile = [];
    this.gameover = false;
    this.cardToBeat = null;
  }

  public startGame(): void {
    this.setUpGame();

    if (this.deckHasCards()) {
      debug('handing Out Cards');
      this.handOutCards();
      this.sendUpdates();
    } else if (!this.deckHasCards() && !this.deckDone) {
      debug('\nTHE PILE HAS RUN OUT OF CARDS!');
      this.deckDone = true;
    }
  }

  public allCardsPlayed(): boolean {
    for (const player of this.players) {
      if (player.haveCards()) {
        return false;
      }
    }
    return true;
  }

  public addPlayer(player: Player, seatPosition: number) {
    if (!this.ownerOfTable) this.ownerOfTable = player;

    const seat = this.players[seatPosition];
    if (seat.name === '') {
      this.players[seatPosition] = player;
    } else throw new Error('seat position is occupied');
    this.sendUpdates();
  }
  public deletePlayer(player: Player, seatPosition: number) {
    this.players[seatPosition] = new Player('');
    this.sendUpdates();
  }
}

export function addPlayer(name: string, table: Table, seatPosition: number) {
  const player = new Player(name);
  table.addPlayer(player, seatPosition);
  debug('this is the second add player function');
  return player;
}

export function deletePlayer(
  player: Player,
  table: Table,
  seatPosition: number
) {
  debug('deleting player:', player);
  table.deletePlayer(player, seatPosition);
}
