import { Player } from './player';
import { Card, FaceType, SuitType } from './card';
import { MessageTableData, TableData } from './wsServer';

import debugLog from 'debug';
const debug = debugLog('table');

export class Table {
  players: Player[];
  deck: Card[] = [];
  id: string;
  /** player who is currently winning the game */
  winningPlayer = 0;
  /** person who won the last game /starts the round */
  leadPlayer = 0;
  /** the person whos turn it is */
  currentPlayer = 0;
  discardPile: Card[] = [];
  cardToBeat: Card | null = null;
  teamAPoints = 0;
  teamBPoints = 0;
  totalCollectedCardsA: Card[] = [];
  totalCollectedCardsB: Card[] = [];
  deckDone: boolean;
  waitingForPlayers = true;
  ownerOfTable: Player = undefined;
  gameInProgress = false;
  round = 0;
  teamAStakeCount = 0;
  teamBStakeCount = 0;
  finalStakeCount = 0; //TODO make players set the stake goul count at the beginning
  teamWonRound = '';
  wonPoints = 0;
  showresults = false;

  constructor(id: string) {
    this.players = [
      new Player(''),
      new Player(''),
      new Player(''),
      new Player(''),
    ];
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
        winningPlayerId: this.players[this.winningPlayer].id,
        leadPlayerId: this.players[this.leadPlayer].id,
        round: this.round,
        cardToBeat: this.cardToBeat,
        teamWonRound: this.teamWonRound,
        wonPoints: this.wonPoints,
        showresults: this.showresults,
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

  public startGame(): void {
    this.setUpGame();

    if (this.deckHasCards()) {
      this.handOutCards();
      this.sendUpdates();
    }
  }

  public setUpGame(): void {
    debug('----A New Game Has Begun----');
    this.createDeck();
    this.shuffleDeck();
    this.assignTeams();

    if (this.leadPlayer) this.currentPlayer = this.leadPlayer;
    else this.currentPlayer = 0;

    this.gameInProgress = true;
    this.leadPlayer = this.currentPlayer;
    this.winningPlayer = this.leadPlayer;
    this.discardPile = [];
    this.cardToBeat = null;
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

  public assignTeams() {
    this.players[0].team = 'A';
    this.players[1].team = 'B';
    this.players[2].team = 'A';
    this.players[3].team = 'B';
  }

  public deckHasCards(): boolean {
    return this.deck.length > 0;
  }

  public handOutCards(): void {
    // Gives each player the amount of cards they are missing
    for (let i = 0; i < this.players.length; i++) {
      const playerToGetCards = (i + this.leadPlayer) % this.players.length;

      if (this.deck.length > 4) {
        while (this.players[playerToGetCards].playerNeedsCards()) {
          if (this.deckHasCards()) {
            this.players[playerToGetCards].getCard(this.deck);
          } else {
            debug('Deck Has <= 4 Cards left');
            break;
          }
        }
      } else {
        if (this.players[playerToGetCards].playerNeedsCards()) {
          if (this.deckHasCards()) {
            this.players[playerToGetCards].getCard(this.deck);
          } else {
            debug('Deck Has No More Cards To Give');
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

    debug(
      'round %s currentplayer %s leadplayer %s',
      this.round,
      this.currentPlayer,
      this.leadPlayer
    );
    if (this.currentPlayer === this.leadPlayer && this.round > 0) {
      if (!this.hasACardToTakeOver()) {
        debug(
          'This player has no card to be able to player, therefore passing'
        );
        this.endRound();
        this.showresults = true;
        return;
      }
    }

    if (!this.canPlayCard(card)) {
      debug('YOU CANT PLAY THIS CARD');
      return;
    } //check if this person can play a card

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

    if (this.currentPlayer === this.leadPlayer) {
      this.round = this.round + 1;
    }

    this.currentPlayer = (this.currentPlayer + 1) % this.players.length; //current player is increased
    this.sendUpdates();

    //checking if next player is an autoplayer and will play untill they arent one
    if (this.players[this.currentPlayer].autoplay) {
      setTimeout(() => {
        this.players[this.currentPlayer].autoplay(this, this.currentPlayer);
        this.sendUpdates();
      }, 2000);
    }
  }
  //TODO: make display of score at end round, program start when all players are ready, make auto start on its own
  public hasACardToTakeOver() {
    return this.players[this.currentPlayer].onHand.find(
      (c) => c.face === this.cardToBeat.face || c.face === 'seven'
    );
  }
  public canPlayCard(card: Card) {
    if (this.leadPlayer === this.currentPlayer && this.round > 0) {
      if (this.winningPlayer === this.currentPlayer) return true;
      else if (card.face === this.cardToBeat.face || card.face === 'seven')
        return true; //if not winning player but still played card
      else {
        debug('cannot play this card!', this.currentPlayer, card);
        return false;
      }
    } else return true;
  }

  public endRound() {
    // Calculate the winner of the round
    this.players[this.winningPlayer].collectWonCards(this.discardPile);
    if (this.players[this.winningPlayer].team === 'A')
      this.discardPile.forEach((c) => {
        this.totalCollectedCardsA.push(c);
      });
    else
      this.discardPile.forEach((c) => {
        this.totalCollectedCardsB.push(c);
      });

    this.leadPlayer = this.winningPlayer;

    this.discardPile = [];
    this.round = 0;

    debug(`\nWinner of the Round: ${this.players[this.winningPlayer].name}`);

    if (!this.deckHasCards() && this.allCardsPlayed()) {
      this.endGame();
      if (this.players[this.leadPlayer].team === 'A') {
        debug('for winning the last deal, team A gets extra 10 points!');
        this.teamAPoints += 10;
      } else {
        debug('for winning the last deal, team B gets extra 10 points!');
        this.teamBPoints += 10;
      }
    }

    this.cardToBeat = null;
    this.evaluateRound();
  }
  public evaluateRound() {
    debug('ROUND END');
    debug(
      'the winning player, and next rounds leading player is:',
      this.leadPlayer
    );
    const team =
      this.players[this.leadPlayer].team === 'A' ? 'Team A' : 'Team B';

    this.teamWonRound = team;
    this.wonPoints = this.players[this.leadPlayer].collectedPoints;
    debug('This round, ', team, ' won ', this.wonPoints, ' points');

    this.showresults = true;
    this.sendUpdates();
    this.wonPoints = 0;
  }

  public endGame() {
    debug('GAMEOVER');
    this.sumUpPoints();
    this.calculateStakes();
  }

  public sumUpPoints() {
    debug('END OF GAME, summing up all the points');
    for (const player of this.players) {
      player.totalCollectedPoints();
    }

    for (const player of this.players) {
      if (player.team === 'A') {
        this.teamAPoints += player.collectedPoints;
      }
      if (player.team === 'B') {
        this.teamBPoints += player.collectedPoints;
      }
    }
  }

  public calculateStakes() {
    const {
      teamAPoints,
      teamBPoints,
      totalCollectedCardsA,
      totalCollectedCardsB,
    } = this;

    if (teamAPoints >= 90 || teamBPoints >= 90) {
      if (totalCollectedCardsA.length === 32) {
        debug(`\nTeam A won all deals and therefore gained 3 stakes!`);
        this.teamAStakeCount += 3;
      } else if (totalCollectedCardsB.length === 32) {
        debug(`\nTeam B won all deals and therefore gained 3 stakes!`);
        this.teamBStakeCount += 3;
      } else {
        if (teamAPoints > teamBPoints) {
          this.teamAStakeCount += 2;
        } else {
          this.teamBStakeCount += 2;
        }
        const winningTeam = teamAPoints > teamBPoints ? 'A' : 'B';
        debug(
          `\nTeam ${winningTeam} has more points, but not all deals, so they win 2 stakes!`
        );
      }
    } else {
      if (teamAPoints > teamBPoints) {
        this.teamAStakeCount += 1;
      } else {
        this.teamBStakeCount += 1;
      }
      const winningTeam = teamAPoints > teamBPoints ? 'A' : 'B';
      debug(
        `\nNo team has earned 90 points. Team ${winningTeam} has more points, so they earn 1 stake.`
      );
    }

    if (this.checkStakeCount()) {
      //completely end game
      debug('THE STAKE COUNT HAS BEEN REACHED! END OF GAME!');
      //TODO: show players their scores, show leaderboard, ask if they which to play again.
    }
  }

  public checkStakeCount() {
    if (
      this.teamAStakeCount >= this.finalStakeCount ||
      this.teamBStakeCount >= this.finalStakeCount
    )
      return true;
    else return false;
  }

  public closeResults() {
    this.showresults = false;
    this.currentPlayer = this.leadPlayer;
    //resets the last played cards to nothing
    this.players.forEach((p) => {
      p.lastPlayedCard = null;
    });

    debug('handing out cards');
    this.handOutCards();

    if (this.players[this.currentPlayer].autoplay) {
      setTimeout(() => {
        this.players[this.currentPlayer].autoplay(this, this.currentPlayer);
      }, 2000);
    }

    this.sendUpdates();
  }

  public addPlayer(player: Player, seatPosition: number) {
    if (!this.ownerOfTable) this.ownerOfTable = player;

    const seat = this.players[seatPosition];
    if (seat.name === '') {
      this.players[seatPosition] = player;
    } else throw new Error('seat position is occupied');
    if (this.players.length > 0) this.sendUpdates();
  }

  public deletePlayer(player: Player, seatPosition: number) {
    this.players[seatPosition] = new Player('');
    this.sendUpdates();
  }

  public playerCount(): number {
    const playerCount = this.players.reduce((total, element) => {
      if (!element.connected) return total;
      else return total + 1;
    }, 0);
    return playerCount;
  }

  public allCardsPlayed(): boolean {
    for (const player of this.players) {
      if (player.haveCards()) {
        return false;
      }
    }
    return true;
  }
}

export function addPlayer(name: string, table: Table, seatPosition: number) {
  const player = new Player(name);
  table.addPlayer(player, seatPosition);
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
