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
  waitingForPlayers = true;
  ownerOfTable: Player = undefined;
  gameInProgress = false;
  round = 0;
  teamAStakeCount = 0;
  teamBStakeCount = 0;
  finalStakeCount = 1; //TODO make players set the stake count at the beginning setting it to 6 for testing
  teamWonRound = '';
  stakesReached = false;
  wonPoints = 0;
  showresults = false;
  gameEnd = false;
  askContinue = false;
  playAgain = false;
  isFirstDeal = 0;

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
        gameEnd: this.gameEnd,
        teamAPoints: this.teamAPoints,
        teamBPoints: this.teamBPoints,
        teamAStakeCount: this.teamAStakeCount,
        teamBStakeCount: this.teamBStakeCount,
        finalStakeCount: this.finalStakeCount,
        askContinue: this.askContinue,
        stakesReached: this.stakesReached,
        playAgain: this.playAgain,
        isFirstDeal: this.isFirstDeal,
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
    this.teamAStakeCount = 0;
    this.teamBStakeCount = 0;
    this.finalStakeCount = 3;
    this.teamWonRound = '';
    this.stakesReached = false;
    this.playAgain = false;

    this.setPlayersToReady();

    this.setUpGame();
  }

  public setUpGame(): void {
    if (!this.allPlayersReady()) {
      debug('waiting for all players to be ready');
      return;
    }
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
    this.gameEnd = false;
    this.teamAPoints = 0;
    this.teamBPoints = 0;
    this.totalCollectedCardsA = [];
    this.totalCollectedCardsB = [];
    this.wonPoints = 0;
    this.askContinue = false;
    this.round = 0;

    this.resetPlayers();

    if (this.deckHasCards()) {
      this.handOutCards();
      this.sendUpdates();
    }
    this.playIfAutoplay();
  }

  public allPlayersReady() {
    let count = 0;
    this.players.forEach((p) => {
      if (p.isReadyToPlay === true || p.autoplay != null) {
        count++;
        debug('player ', p.name, 'is ready');
      }
    });

    if (count === 4) return true;
    else return false;
  }
  public resetPlayers() {
    for (const player of this.players) {
      player.collectedPoints = 0;
      player.cardsWon = [];
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

  public assignTeams() {
    this.players[0].team = 'A';
    this.players[1].team = 'B';
    this.players[2].team = 'A';
    this.players[3].team = 'B';
  }

  public deckHasCards(): boolean {
    return this.deck.length > 0;
  }
  public playersDontHaveCards(): boolean {
    let count = 0;
    this.players.forEach((p) => {
      if (p.onHand.length === 0) count += 1;
    });

    return count === 4;
  }

  public handOutCards(): void {
    // Gives each player the amount of cards they are missing
    if (this.deck.length <= 3) return;
    debug('deck has', this.deck.length, ' cards');

    for (let i = 0; i < 4; i++) {
      for (let j = this.leadPlayer; j < this.leadPlayer + 4; j++) {
        const playerToGetCards = j % this.players.length;

        if (this.deckHasCards()) {
          this.players[playerToGetCards].getCard(this.deck);
        } else {
          debug('Deck Has No More Cards To Give');
          break;
        }
      }
    }

    this.players.map((p) => debug(p.name, p.onHand));
  }

  public validateTurn(player: Player, card: Card): boolean {
    if (!player) {
      throw new Error('Player not found on the table');
    } else if (player.isReadyToPlay !== true) {
      debug(
        'how if the world are you playing a card if you arent ready to play?'
      );
      return false;
    } else if (this.players.indexOf(player) !== this.currentPlayer) {
      throw new Error('It is not your turn to play');
    } else if (!this.canPlayCard(card)) {
      throw new Error('You cant play this card');
    } else return true;
  }
  public cardPlayed(player, card) {
    this.wonPoints += card.points;
    this.discardPile.push(card);

    const cardIdx = player.onHand.findIndex(
      (c) => c.face === card.face && c.suit === card.suit
    );
    player.onHand.splice(cardIdx, 1);
    player.lastPlayedCard = card;
  }

  public playCard(playerId: string, card: Card) {
    const player = this.players.find((p) => p.id === playerId);
    debug(
      this.players[this.currentPlayer].name,
      ' has ',
      this.players[this.currentPlayer].onHand.length,
      'cards and is playing card: ',
      card
    );

    if (!this.validateTurn(player, card)) return;

    this.cardPlayed(player, card);

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
      this.isFirstDeal += 1;
    }
    this.currentPlayer = (this.currentPlayer + 1) % this.players.length; //current player is increased

    this.sendUpdates();

    if (
      this.currentPlayer === this.leadPlayer &&
      !this.hasACardToTakeOver() &&
      this.isFirstDeal != 0
    ) {
      this.endRound();
      console.log('automatic passing');
      return;
    }

    if (!this.deckHasCards && this.playersDontHaveCards()) {
      debug('game is ending, no cards left');
      setTimeout(() => {
        this.endRound();
        return;
      }, 3000);
    }

    this.sendUpdates();
    this.playIfAutoplay();
  }

  public hasACardToTakeOver() {
    if (this.cardToBeat === null) return;
    return this.players[this.currentPlayer].onHand.find(
      (c) => c.face === this.cardToBeat.face || c.face === 'seven'
    );
  }
  public canPlayCard(card: Card) {
    if (this.leadPlayer === this.currentPlayer && this.isFirstDeal > 0) {
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
    this.playersArentReady();
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
    this.cardToBeat = null;
    this.evaluateRound();
  }
  public evaluateRound() {
    const team =
      this.players[this.leadPlayer].team === 'A' ? 'Team A' : 'Team B';

    this.teamWonRound = team;

    debug('This round, ', team, ' won ', this.wonPoints, ' points');
    this.showresults = true;
    this.isFirstDeal = 0;
    this.sendUpdates();
  }

  public endGame() {
    debug('GAMEOVER');
    this.sumUpPoints();
    this.calculateStakes();
    this.gameEnd = true;
    this.showresults = false;
    this.sendUpdates();
  }

  public sumUpPoints() {
    for (const player of this.players) {
      if (player.team === 'A') {
        this.teamAPoints += player.collectedPoints;
      }
      if (player.team === 'B') {
        this.teamBPoints += player.collectedPoints;
      }
    }
    debug(
      'after summing up points teamA',
      this.teamAPoints,
      'team B ',
      this.teamBPoints
    );
  }
  public playersArentReady() {
    this.players.forEach((p) => (p.isReadyToPlay = false));
  }
  public setPlayersToReady() {
    this.players.forEach((p) => (p.isReadyToPlay = true));
  }
  public setcomputerToReady() {
    this.players.forEach((p) => {
      if (p.autoplay !== null) p.isReadyToPlay = true;
    });
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
        this.teamWonRound = 'Team A';
        this.teamAStakeCount += 3;
      } else if (totalCollectedCardsB.length === 32) {
        debug(`\nTeam B won all deals and therefore gained 3 stakes!`);
        this.teamWonRound = 'Team B';
        this.teamBStakeCount += 3;
      } else {
        if (teamAPoints > teamBPoints) {
          this.teamAStakeCount += 2;
          this.teamWonRound = 'Team A';
        } else {
          this.teamBStakeCount += 2;
          this.teamWonRound = 'Team B';
        }
        const winningTeam = teamAPoints > teamBPoints ? 'A' : 'B';
        debug(
          `\nTeam ${winningTeam} has more points, but not all deals, so they win 2 stakes!`
        );
        this.teamWonRound = `Team ${winningTeam}`;
      }
    } else {
      if (teamAPoints > teamBPoints) {
        this.teamAStakeCount += 1;
        this.teamWonRound = 'Team A';
      } else {
        this.teamBStakeCount += 1;
        this.teamWonRound = 'Team B';
      }
      const winningTeam = teamAPoints > teamBPoints ? 'A' : 'B';
      debug(
        `\nNo team has earned 90 points. Team ${winningTeam} has more points, so they earn 1 stake.`
      );
      this.teamWonRound = `Team ${winningTeam}`;
    }
    debug(
      '--------at end of calculate stakes, winnnig team: ',
      this.teamWonRound
    );
  }

  public checkStakeCount() {
    if (
      this.teamAStakeCount >= this.finalStakeCount ||
      this.teamBStakeCount >= this.finalStakeCount
    )
      return true;
    else return false;
  }

  public closeResults(playerIdx: number) {
    this.showresults = false;
    this.wonPoints = 0;
    this.playerIsReady(playerIdx);
    this.setcomputerToReady();
    this.currentPlayer = this.leadPlayer;
    //resets the last played cards to nothing
    this.players.forEach((p) => {
      p.lastPlayedCard = null;
    });

    if (!this.deckHasCards() && this.allCardsPlayed()) {
      if (this.players[this.leadPlayer].team === 'A') {
        debug('for winning the last deal, team A gets extra 10 points!');
        this.teamAPoints += 10;
      } else {
        debug('for winning the last deal, team B gets extra 10 points!');
        this.teamBPoints += 10;
      }
      this.endGame();
      return;
    }

    if (this.deckHasCards) {
      debug('not end of game, so handing out cards');
      this.handOutCards();

      this.playIfAutoplay();
    }

    this.sendUpdates();
  }
  public closeEndGameResults(playerIdx: number) {
    this.gameEnd = false;
    this.showresults = false;

    this.playerIsReady(playerIdx);
    this.setcomputerToReady();

    if (this.checkStakeCount()) {
      debug('THE STAKE COUNT HAS BEEN REACHED! END OF GAME!');
      this.stakesReached = true;
      this.sendUpdates();
    } else {
      debug('The stake count has not been reached yet');
      this.askContinue = true;
      this.sendUpdates();
    }
  }

  public wantContinue() {
    this.stakesReached = false;
    this.playAgain = true;
    this.sendUpdates();
  }
  public playerIsReady(playerIdx: number) {
    this.players[playerIdx].isReadyToPlay = true;
  }

  public playIfAutoplay() {
    if (this.players[this.currentPlayer].autoplay) {
      setTimeout(() => {
        this.players[this.currentPlayer].autoplay(this, this.currentPlayer);
        this.sendUpdates();
      }, 1000);
    }
  }
  public playerDisconnect(playerIdx: number) {
    const isOwner = this.ownerOfTable.id === this.players[playerIdx].id;
    if (isOwner) {
      this.players.forEach((p, i) => {
        if (p.name !== '' && i !== playerIdx) {
          console.log('disconecting ', p.name);
          this.playerDisconnect(i);
        } else console.log('player', p.name, 'is not disconnecting');
      });
    }
    this.players[playerIdx].disconnect();
    this.players[playerIdx] = new Player('');
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
