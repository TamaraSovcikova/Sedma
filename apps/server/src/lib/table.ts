import { Player } from './player';
import { Card } from './card';
import { MessageTableData, TableData, sendMessageToPlayer } from './wsServer';

export class Table {
  players: Player[];
  deck: Card[] = [];
  discard: Card[] = [];
  id: string;
  winningPlayer: number;
  leadPlayer: number;
  playedCards: Card[] = [];
  cardToBeat: Card | null = null;
  teamAPoints: number;
  teamBPoints: number;
  pileDone: boolean;
  gameover: boolean;
  lastPlayedCard: Card = null;

  constructor(id: string) {
    const emptyPlayer = new Player('');
    this.players = [emptyPlayer, emptyPlayer, emptyPlayer, emptyPlayer];
    this.id = id;
  }

  public sendUpdates() {
    const players = this.players.map((p) => ({ name: p.name, id: p.id }));
    const lastPlayedCards = this.players.map((p) => p.lastPlayedCard);

    for (const p of this.players) {
      const hand = p.onHand;
      const data: TableData = { players, lastPlayedCards, hand };
      const messageData: MessageTableData = {
        data,
        type: 'tableData',
        tableId: this.id,
      };
      console.log('players data:', data, 'and player id: ', p.id);

      sendMessageToPlayer(p.id, messageData);
    }
  }

  public playCard(playerId: string, card: Card) {
    const player = this.players.find((p) => p.id === playerId);

    if (!player) {
      throw new Error('Player not found on the table'); //no idea if how this works
    }
    if (this.players.indexOf(player) !== this.leadPlayer) {
      throw new Error('It is not your turn to play');
    }

    this.playedCards.push(card);

    // Check if the card beats the current card to beat
    if (this.cardToBeat === null) {
      this.cardToBeat = card;
    } else {
      if (card.face === this.cardToBeat.face || card.face === 'seven') {
        this.winningPlayer = this.players.indexOf(player);
        console.log(`${player.name} owns the pile`);
      }
    }

    this.leadPlayer = (this.leadPlayer + 1) % this.players.length;
    if (this.playedCards.length === this.players.length) {
      this.endRound();
    }

    this.sendUpdates();

    if (this.gameover) {
      this.evaluateGame();
      this.showResults();
    }
  }

  public endRound() {
    // Calculate the winner of the round
    this.winningPlayer = this.leadPlayer;
    this.players[this.winningPlayer].collectWonCards(this.playedCards);
    this.playedCards = [];

    console.log(
      `\nWinner of the Round: ${this.players[this.winningPlayer].name}`
    );

    if (!this.pileHasCards() && this.endGame()) {
      this.gameover = true;
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
    //keep that in there for now
    console.log('END, time to sum the points');
  }

  public showResults() {
    if (this.players.length === 4) {
      if (this.teamAPoints > this.teamBPoints) {
        console.log(`\nTeam A, Won this game: ${this.teamAPoints}!`);
      } else if (this.teamBPoints > this.teamAPoints) {
        console.log(`\nTeam B, Won this game: ${this.teamAPoints}!`);
      } else {
        console.log('\nThis game ended in a DRAW!');
      }
    }
  }
  public pileHasCards(): boolean {
    return this.deck.length > 0;
  }
  public endGame(): boolean {
    for (const player of this.players) {
      if (player.haveCards()) {
        return false;
      }
    }
    return true;
  }

  public addPlayer(player: Player, seatPosition: number) {
    const seat = this.players[seatPosition];
    if (seat.name === '') {
      this.players[seatPosition] = player;
    } else throw new Error('seat position is occupied');
    this.sendUpdates();
  }
}

export function addPlayer(name: string, table: Table, seatPosition: number) {
  const player = new Player(name);
  table.addPlayer(player, seatPosition);
  return player;
}
