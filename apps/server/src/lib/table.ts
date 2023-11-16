import {
  TableData,
  SuitType,
  FaceType,
  CardData,
  MessageBase,
  GameData,
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
  winningTeamPoints = 0;
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
  /* count of points collected at the end of the deal */
  wonPoints = 0;
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
      gameInProgress: this.gameInProgress,
      winningPlayerId: this.players[this.winningPlayer].id,
      leadPlayerId: this.players[this.leadPlayer].id,
      round: this.round,
      cardToBeat: this.cardToBeat,
      teamWonRound: this.teamWonRound,
      wonPoints: this.wonPoints,
      teamAStakeCount: this.teamAStakeCount,
      teamBStakeCount: this.teamBStakeCount,
      stakesReached: this.stakesReached,
      playAgain: this.playAgain,
      isFirstDeal: this.isFirstDeal,
      winningTeamPoints: this.winningTeamPoints,
      ownerOfTableId: this.ownerOfTable.id,
      finalStakeCount: this.finalStakeCount,
    };
  }

  public sendUpdates() {
    const debug2 = debug.extend('sendUpdates');
    for (const p of this.players) {
      const data: TableData = this.getPlayerData(p);
      const messageData = {
        data,
        type: 'tableData',
        tableId: this.id,
      };
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
      debug('waiting for all players to be ready');
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
    this.teamAPoints = 0;
    this.teamBPoints = 0;
    this.totalCollectedCardsA = [];
    this.totalCollectedCardsB = [];
    this.wonPoints = 0;
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
    const playersWithoutCardsCount = this.players.filter(
      (player) => player.onHand.length === 0
    ).length;
    return playersWithoutCardsCount === this.players.length;
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

    if (this.leadPlayerHasToPass()) {
      this.endRound();
      debug('Automatic passing');
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

  private leadPlayerHasToPass(): boolean {
    return (
      this.currentPlayer === this.leadPlayer &&
      !this.hasACardToTakeOver() &&
      this.isFirstDeal !== 0
    );
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
    this.setPlayersNotReady();
    this.players[this.winningPlayer].collectWonCards(this.discardPile);

    const winningTeam = this.players[this.winningPlayer].team;
    this.addWonCardsToTeam(winningTeam);

    this.leadPlayer = this.winningPlayer;
    this.discardPile = [];
    this.cardToBeat = null;

    this.evaluateRound();
  }

  private addWonCardsToTeam(winningTeam: string): void {
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
    this.showResults();

    this.isFirstDeal = 0;
    this.sendUpdates();
  }

  private showResults() {
    for (const p of this.players) {
      const messageData: MessageBase = {
        type: 'showResults',
        tableId: this.id,
      };

      if (p.ws) p.ws.send(JSON.stringify(messageData));
    }
  }

  public endGame() {
    debug('GAMEOVER');
    this.sumUpPoints();
    this.calculateStakes();

    this.showEndGameResults();
    this.sendUpdates();
  }

  private showEndGameResults() {
    for (const p of this.players) {
      const messageData: MessageBase = {
        type: 'showEndGameResults',
        tableId: this.id,
      };

      if (p.ws) p.ws.send(JSON.stringify(messageData));
    }
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

  public setPlayersNotReady() {
    this.players.forEach((p) => {
      if (p.autoplay === null) p.isReadyToPlay = false;
      else p.isReadyToPlay = true;
    });
  }

  public setPlayersToReady() {
    this.players.forEach((p) => (p.isReadyToPlay = true));
  }

  private calculateWinningTeamPoints(teamAPoints: number, teamBPoints: number) {
    if (teamAPoints > teamBPoints) {
      this.winningTeamPoints = teamAPoints;
    } else {
      this.winningTeamPoints = teamBPoints;
    }
  }

  public calculateStakes(): void {
    const { teamAPoints, teamBPoints, totalCollectedCardsA } = this;
    const winningTeam = teamAPoints > teamBPoints ? 'A' : 'B';
    this.calculateWinningTeamPoints(teamAPoints, teamBPoints);

    if (teamAPoints >= 90 || teamBPoints >= 90) {
      const isTeamAWinner = winningTeam === 'A';
      const stakeCount = isTeamAWinner
        ? totalCollectedCardsA.length === 32
          ? 3
          : 2
        : 0;

      this.teamWonRound = `Team ${winningTeam}`;

      if (isTeamAWinner) {
        this.teamAStakeCount += stakeCount;
      } else {
        this.teamBStakeCount += stakeCount;
      }
    } else {
      this.teamWonRound = winningTeam === 'A' ? 'Team A' : 'Team B';
      const stakeCount = totalCollectedCardsA.length === 32 ? 3 : 1;

      if (winningTeam === 'A') {
        this.teamAStakeCount += stakeCount;
      } else {
        this.teamBStakeCount += stakeCount;
      }
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

  public closeResults(playerIdx: number): void {
    this.playerIsReady(playerIdx);

    if (this.allPlayersReady) {
      this.setUpNewDeal();
    }

    this.sendUpdates();
  }

  private setUpNewDeal() {
    this.players.forEach((p) => (p.lastPlayedCard = null));

    if (this.isLastRound()) {
      const winningTeam = this.players[this.leadPlayer].team;

      winningTeam === 'A' ? (this.teamAPoints += 10) : (this.teamBPoints += 10);
      this.endGame();
    } else {
      this.currentPlayer = this.leadPlayer;
      this.wonPoints = 0;
      this.handOutCards();
      this.playIfAutoplay();
    }
  }

  private isLastRound(): boolean {
    return !this.deckHasCards() && this.allCardsPlayed();
  }

  public closeEndGameResults(playerIdx: number) {
    this.playerIsReady(playerIdx);

    if (this.checkStakeCount()) {
      debug('THE STAKE COUNT HAS BEEN REACHED! END OF GAME!');
      this.stakesReached = true;
      this.sendUpdates();
    } else {
      debug('The stake count has not been reached yet');

      this.askGameContinue();
      this.sendUpdates();
    }
  }

  private askGameContinue() {
    for (const p of this.players) {
      const messageData: MessageBase = {
        type: 'askGameContinue',
        tableId: this.id,
      };

      if (p.ws) p.ws.send(JSON.stringify(messageData));
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
          debug('disconecting ', p.name);
          this.playerDisconnect(i);
        } else debug('player', p.name, 'is not disconnecting');
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

  private allCardsPlayed(): boolean {
    return this.players.every((player) => player.onHand.length === 0);
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
