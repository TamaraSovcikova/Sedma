import {
  TableData,
  MessageTableData,
  SuitType,
  FaceType,
  CardData,
} from '@tnt-react/ws-messages';
import { Card } from './card';
import { Player } from './player';

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
  cardToBeat: CardData | null = null;
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
  finalStakeCount = 1; // set to 1 as base;
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

  private getPlayerList(): { name: string; id: string; bodyColor: string }[] {
    return this.players.map((p) => ({
      name: p.name,
      id: p.id,
      bodyColor: p.bodyColor,
    }));
  }

  private getLastPlayedCards(): CardData[] {
    return this.players.map((p) => p.lastPlayedCard);
  }

  private getPlayerData(p: Player): TableData {
    const hand = p.onHand;
    const waitingForPlayers = this.playerCount() < 4;

    return {
      players: this.getPlayerList(),
      lastPlayedCards: this.getLastPlayedCards(),
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
  }

  private createMessageData(p: Player): MessageTableData {
    const data: TableData = this.getPlayerData(p);
    return {
      data,
      type: 'tableData',
      tableId: this.id,
    };
  }

  public sendUpdates() {
    const debug2 = debug.extend('sendUpdates');
    for (const p of this.players) {
      const messageData = this.createMessageData(p);
      debug2('players data:', messageData.data, 'and player id: ', p.id);

      if (p.ws) p.ws.send(JSON.stringify(messageData));
    }
  }

  public startGame(): void {
    this.teamAStakeCount = 0;
    this.teamBStakeCount = 0;
    this.teamWonRound = '';
    this.stakesReached = false;
    this.playAgain = false;

    this.setPlayersToReady();

    this.setUpGame();
  }

  public setUpGame(): void {
    if (!this.allPlayersReady()) {
      debug('waiting for all players to be ready'); //TODO WILL ADD THE DISPLAY MESSAGE FROM HERE
      return;
    }
    debug('----A New Game Has Begun----');
    this.initializeGame();

    if (this.deckHasCards()) {
      this.handOutCards();
      this.sendUpdates();
    }
    this.playIfAutoplay();
  }

  private initializeGame(): void {
    this.createDeck();
    this.shuffleDeck();
    this.assignTeams();

    this.currentPlayer = this.leadPlayer ?? 0;

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

  public validateTurn(player: Player, card: CardData): boolean {
    if (!player) {
      throw new Error('Player not found on the table');
    }

    if (!player.isReadyToPlay) {
      debug('Why are you playing a card if you are not ready to play?');
      return false;
    }

    if (this.players.indexOf(player) !== this.currentPlayer) {
      throw new Error('It is not your turn to play');
    }

    if (!this.canPlayCard(card)) {
      throw new Error('You cannot play this card');
    }

    return true;
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

  public playCard(playerId: string, card: CardData) {
    const player = this.players.find((p) => p.id === playerId);

    if (!this.validateTurn(player, card)) return;

    this.cardPlayed(player, card);

    this.checkIfCardToBeatBet(player, card);
    this.updateRound();

    this.sendUpdates();

    if (this.shouldEndRoundAutomatically()) {
      this.endRound();
      console.log('Automatic passing');
      return;
    }

    if (this.shouldEndGame()) {
      debug('Game is ending, no cards left');
      setTimeout(() => this.endRound(), 3000);
      return;
    }

    this.sendUpdates();
    this.playIfAutoplay();
  }

  private checkIfCardToBeatBet(player: Player, card: CardData): void {
    if (this.cardToBeat === null) {
      this.cardToBeat = card;
    } else {
      if (card.face === this.cardToBeat.face || card.face === 'seven') {
        this.winningPlayer = this.players.indexOf(player);
        debug(`${player.name} owns the pile`);
      }
    }
  }

  private updateRound(): void {
    if (this.currentPlayer === this.leadPlayer) {
      this.round++;
      this.isFirstDeal++;
    }

    this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
  }

  private shouldEndRoundAutomatically(): boolean {
    return (
      this.currentPlayer === this.leadPlayer &&
      !this.hasACardToTakeOver() &&
      this.isFirstDeal !== 0
    );
  }

  private shouldEndGame(): boolean {
    return !this.deckHasCards && this.playersDontHaveCards();
  }

  public hasACardToTakeOver() {
    if (this.cardToBeat === null) return;
    return this.players[this.currentPlayer].onHand.find(
      (c) => c.face === this.cardToBeat.face || c.face === 'seven'
    );
  }
  public canPlayCard(card: CardData) {
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

    const winningTeam = this.players[this.winningPlayer].team;
    this.collectWonCards(winningTeam);

    this.leadPlayer = this.winningPlayer;
    this.discardPile = [];
    this.cardToBeat = null;

    this.evaluateRound();
  }

  private collectWonCards(winningTeam: string): void {
    const collectedCards =
      winningTeam === 'A'
        ? this.totalCollectedCardsA
        : this.totalCollectedCardsB;
    this.discardPile.forEach((card) => collectedCards.push(card));
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

  public calculateStakes(): void {
    const { teamAPoints, teamBPoints, totalCollectedCardsA } = this;
    const winningTeam = teamAPoints > teamBPoints ? 'A' : 'B';

    if (teamAPoints >= 90 || teamBPoints >= 90) {
      const isTeamAWinner = winningTeam === 'A';
      let stakeCount = isTeamAWinner
        ? this.teamAStakeCount
        : this.teamBStakeCount;

      stakeCount += totalCollectedCardsA.length === 32 ? 3 : 2;
      this.teamWonRound = `Team ${winningTeam}`;
      debug(
        `\nTeam ${winningTeam} won all deals and therefore gained ${stakeCount} stakes!`
      );
    } else {
      this.teamWonRound = winningTeam === 'A' ? 'Team A' : 'Team B';
      this.teamAStakeCount += winningTeam === 'A' ? 2 : 1;
      this.teamBStakeCount += winningTeam === 'B' ? 2 : 1;
      debug(
        `\nTeam ${winningTeam} has more points, but not all deals, so they win 2 stakes!`
      );
    }

    debug(
      `\n--------at end of calculate stakes, winning team: ${this.teamWonRound}`
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

  public closeResults(playerIdx: number): void {
    this.playerIsReady(playerIdx);

    if (this.leadPlayer === playerIdx) {
      this.wonPoints = 0;
      this.setcomputerToReady();
      this.currentPlayer = this.leadPlayer;

      this.players.forEach((p) => (p.lastPlayedCard = null));

      if (!this.deckHasCards() && this.allCardsPlayed()) {
        const winningTeam = this.players[this.leadPlayer].team;
        debug(
          `for winning the last deal, team ${winningTeam} gets extra 10 points!`
        );
        winningTeam === 'A'
          ? (this.teamAPoints += 10)
          : (this.teamBPoints += 10);
        this.endGame();
        return;
      }

      if (this.deckHasCards) {
        debug('not end of game, so handing out cards');
        this.handOutCards();
        this.playIfAutoplay();
      }
    }

    this.sendUpdates();
  }

  public closeEndGameResults(playerIdx: number) {
    this.gameEnd = false;

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
        if (p.autoplay !== null) return; //handling computer players
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
