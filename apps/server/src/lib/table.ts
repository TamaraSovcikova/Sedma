import {
  TableData,
  SuitType,
  FaceType,
  CardData,
  MessageBase,
} from '@tnt-react/ws-messages';
import { Card } from './card';
import { Player } from './player';

import debugLog from 'debug';
const debug = debugLog('table');

//The table class represents the game table
export class Table {
  players: Player[];
  deck: Card[] = [];
  id: string;
  /** player who is currently winning the game */
  winningPlayer = 0;
  /** player who won the last game /starts the round */
  leadPlayer = 0;
  /** player whos turn it is */
  currentPlayer = 0;
  /** player who created the table */
  ownerOfTable: Player = undefined;
  discardPile: Card[] = [];
  cardToBeat: CardData | null = null;
  winningTeamPoints = 0;
  teamAPoints = 0;
  teamBPoints = 0;
  totalCollectedCardsA: Card[] = [];
  totalCollectedCardsB: Card[] = [];
  /* is true until 4 players are connected */
  waitingForPlayers = true;
  gameInProgress = false;
  everyoneReady = true;
  round = 0;
  teamAStakeCount = 0;
  teamBStakeCount = 0;
  finalStakeCount = 1; // set to 1 as default
  teamWonRound = '';
  /* count of points collected at the end of the deal */
  wonPoints = 0;
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

  //Return the list of players
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

  //Hold the current state of the game
  private getGameData(p: Player): TableData {
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
      isFirstDeal: this.isFirstDeal,
      winningTeamPoints:
        this.teamAPoints > this.teamBPoints
          ? this.teamAPoints
          : this.teamBPoints,
      ownerOfTableId: this.ownerOfTable.id,
      finalStakeCount: this.finalStakeCount,
      everyoneReady: this.allPlayersReady(),
    };
  }

  /*Send updates to all connected players with the current game state*/
  public sendUpdates() {
    const debug2 = debug.extend('sendUpdates');
    for (const p of this.players) {
      const data: TableData = this.getGameData(p);
      const messageData = {
        data,
        type: 'tableData',
        tableId: this.id,
      };
      debug2('players data:', messageData.data, 'and player id: ', p.id);

      if (p.ws) p.ws.send(JSON.stringify(messageData));
    }
  }

  //Resets the table
  public resetGame(): void {
    this.teamAStakeCount = 0;
    this.teamBStakeCount = 0;
    this.teamWonRound = '';
    this.discardPile = [];
    this.cardToBeat = null;
    this.teamAPoints = 0;
    this.teamBPoints = 0;
    this.totalCollectedCardsA = [];
    this.totalCollectedCardsB = [];
    this.wonPoints = 0;
    this.round = 0;

    this.resetPlayers();
    this.leadPlayer = this.players.indexOf(this.ownerOfTable);
    this.currentPlayer = this.leadPlayer;

    this.sendUpdates();
  }

  //Setting the base game stats to 0
  public startGame(): void {
    this.teamAStakeCount = 0;
    this.teamBStakeCount = 0;
    this.teamWonRound = '';

    this.setPlayersToReady();

    this.setUpGame();
  }

  //Starting the game off
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

  //Preparing the game for gameplay
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
    this.isFirstDeal = 0;

    this.resetPlayers();
  }

  //Checks if all players are ready to play
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

  //Reseting the states of all players
  public resetPlayers() {
    for (const player of this.players) {
      player.collectedPoints = 0;
      player.cardsWon = [];
      player.onHand = [];
      player.lastPlayedCard = null;
    }
  }

  //Makes a deck of 32 cards
  public createDeck(): Card[] {
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

  //Makes a new list which will hold the shuffled card
  public shuffleDeck(): Card[] {
    this.deck.sort(() => Math.random() - 0.5);
    return this.deck;
  }

  //Assigning players to a team depending on their seat
  public assignTeams() {
    this.players[0].team = 'A';
    debug(this.players[0].getName(), 'is on Team ' + this.players[0].team);
    this.players[2].team = 'A';
    debug(this.players[2].getName(), 'is on Team ' + this.players[2].team);
    this.players[1].team = 'B';
    debug(this.players[1].getName(), 'is on Team ' + this.players[1].team);
    this.players[3].team = 'B';
    debug(this.players[3].getName(), 'is on Team ' + this.players[3].team);
  }

  public deckHasCards(): boolean {
    return this.deck.length > 0;
  }

  // Gives each player the amount of cards they are missing
  public handOutCards(): void {
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

  //Making sure the player can play the card they are selecting
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

    if (!this.canPlayCardForNewRound(card)) {
      throw new Error('You cannot play this card');
    }

    return true;
  }

  //Handles the processing of a card play
  public cardPlayed(player, card) {
    this.wonPoints += card.points;
    this.discardPile.push(card);

    const cardIdx = player.onHand.findIndex(
      (c) => c.face === card.face && c.suit === card.suit
    );
    player.onHand.splice(cardIdx, 1); //removing the card from the player's hand
    player.lastPlayedCard = card;
  }

  //Overarching method that handles playing a card
  public playCard(playerId: string, card: CardData) {
    const player = this.players.find((p) => p.id === playerId);

    if (!this.validateTurn(player, card)) return;

    this.cardPlayed(player, card);

    this.checkIfCardToBeatBet(player, card);
    this.updateRound();

    this.sendUpdates();

    //Passes automaticlly if a computer player has nothing to play as a lead player
    if (this.leadPlayerHasToPass() && this.players[this.leadPlayer].autoplay) {
      this.endRound();
      debug('Automatic passing');
      return;
    }

    this.sendUpdates();
    this.playIfAutoplay();
  }

  //Check if the card played is a seven or the same face as the card to beat, setting the player as the
  //new winning player if it is
  private checkIfCardToBeatBet(player: Player, card: CardData): void {
    if (this.cardToBeat === null) {
      this.cardToBeat = card;
    } else {
      if (card.face === this.cardToBeat.face || card.face === 'seven') {
        this.winningPlayer = this.players.indexOf(player);
      }
    }
  }

  //Updating the Round count and current player
  private updateRound(): void {
    if (this.currentPlayer === this.leadPlayer) {
      this.round++;
      this.isFirstDeal++;
    }

    this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
  }

  //Checks if the leadplayer has a card to beat the card to beat
  private leadPlayerHasToPass(): boolean {
    return (
      this.currentPlayer === this.leadPlayer &&
      !this.hasACardToTakeOver() &&
      this.isFirstDeal !== 0
    );
  }

  //Checks if player owns a card that can beat the card to beat
  public hasACardToTakeOver() {
    if (this.cardToBeat === null) return;
    return this.players[this.currentPlayer].onHand.find(
      (c) => c.face === this.cardToBeat.face || c.face === 'seven'
    );
  }

  //When deal loops back around to lead player, allow them to only player a
  //card that can beat the card to beat
  public canPlayCardForNewRound(card: CardData) {
    if (this.leadPlayer === this.currentPlayer && this.isFirstDeal > 0) {
      if (card.face === this.cardToBeat.face || card.face === 'seven')
        return true;
      else {
        debug('cannot play this card!', this.currentPlayer, card);
        return false;
      }
    } else return true;
  }

  public endRound() {
    this.setPlayersNotReady();
    //Give cards from discardPile to winning teams possession
    this.players[this.winningPlayer].collectWonCards(this.discardPile);
    const winningTeam = this.players[this.winningPlayer].team;
    this.addWonCardsToTeam(winningTeam);

    //Updating the person who won the last round to be the person who starts the next.
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
    //Find which team won the round
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

  //Add round points to the team which won
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

  //Setting all players to not ready
  public setPlayersNotReady() {
    this.players.forEach((p) => {
      if (p.autoplay === null) p.isReadyToPlay = false;
      else p.isReadyToPlay = true;
    });
  }

  //Setting all players to ready
  public setPlayersToReady() {
    this.players.forEach((p) => (p.isReadyToPlay = true));
  }

  //Calculate the stakes to be assigned to the team that won the game
  public calculateStakes(): void {
    const {
      teamAPoints,
      teamBPoints,
      totalCollectedCardsA,
      totalCollectedCardsB,
    } = this;
    const winningTeam = teamAPoints > teamBPoints ? 'A' : 'B';

    if (winningTeam === 'A') {
      if (totalCollectedCardsA.length === 32) {
        this.teamAStakeCount += 3;
        return;
      } else if (teamAPoints == 90) {
        this.teamAStakeCount += 2;
        return;
      } else this.teamAStakeCount++;
    } else {
      if (totalCollectedCardsB.length === 32) {
        this.teamBStakeCount += 3;
        return;
      } else if (teamBPoints == 90) {
        this.teamBStakeCount += 2;
        return;
      } else this.teamBStakeCount++;
    }

    this.teamWonRound = `Team ${winningTeam}`;
  }

  //Check if stake count has been reached
  public stakeCountReached() {
    if (
      this.teamAStakeCount >= this.finalStakeCount ||
      this.teamBStakeCount >= this.finalStakeCount
    )
      return true;
    else return false;
  }

  //Method that runs after the player clicks on the close button of the results popup
  public closeResults(playerIdx: number): void {
    this.players[playerIdx].isReadyToPlay = true;

    if (this.players.filter((p) => p.isReadyToPlay === true).length === 1) {
      this.setUpNewDeal();
    }

    this.sendUpdates();
  }

  //Preparing for a new deal
  private setUpNewDeal() {
    this.players.forEach((p) => (p.lastPlayedCard = null));

    //Check is game is ending (e.g is the last round)
    if (
      this.isLastRound() &&
      this.players.filter((p) => p.isReadyToPlay === true).length === 1
    ) {
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

  //Will return true if the deck is empty and players don't have any cards on hand
  private isLastRound(): boolean {
    return !this.deckHasCards() && this.allCardsPlayed();
  }

  //method that runs after the player clicks on the close button of the end results popup
  public closeEndGameResults(playerIdx: number) {
    this.players[playerIdx].isReadyToPlay = true;

    if (this.players[playerIdx] === this.ownerOfTable) {
      if (this.stakeCountReached()) {
        debug('THE STAKE COUNT HAS BEEN REACHED! END OF GAME!');
        this.setStakesReached();
        this.sendUpdates();
      } else {
        debug('The stake count has not been reached yet');

        this.askGameContinue();
        this.sendUpdates();
      }
    }
  }

  //Message all players asking if they wish to stay in the game or leave
  private askGameContinue() {
    for (const p of this.players) {
      const messageData: MessageBase = {
        type: 'askGameContinue',
        tableId: this.id,
      };

      if (p.ws) p.ws.send(JSON.stringify(messageData));
    }
  }

  //Let all the players know that the stakes goal has been reached
  private setStakesReached() {
    this.setPlayersNotReady();
    this.gameInProgress = false;
    for (const p of this.players) {
      const messageData: MessageBase = {
        type: 'stakesReached',
        tableId: this.id,
      };

      if (p.ws) p.ws.send(JSON.stringify(messageData));
    }
  }

  //Setting player to ready to play, meaning they have closed their results popup
  public playerIsReady(playerIdx: number) {
    this.players[playerIdx].isReadyToPlay = true;
  }

  //If the next player (e.g. now the new current player) is a computer, they are automatically prompted to play
  public playIfAutoplay() {
    if (this.players[this.currentPlayer].autoplay) {
      setTimeout(() => {
        this.players[this.currentPlayer].autoplay(this, this.currentPlayer);
        this.sendUpdates();
      }, 1000);
    }
  }

  //Disconnects a player
  public playerDisconnect(playerIdx: number) {
    const isOwner = this.ownerOfTable.id === this.players[playerIdx].id;
    //If the player disconnecting is the owner, recursively call player disconnect for all players on the table
    if (isOwner) {
      this.players.forEach((p, i) => {
        if (p.autoplay !== null) return; //handling computer players
        if (p.name !== '' && i !== playerIdx) {
          debug('disconecting ', p.name);
          //Recursion
          this.playerDisconnect(i);
        } else debug('player', p.name, 'is not disconnecting');
      });
    }
    this.players[playerIdx].disconnect();
    //after disconnecting, player is replaced by a Player placeholder
    this.deletePlayer(this.players[playerIdx], playerIdx);
  }

  //Adds a player to the table
  public addPlayer(player: Player, seatPosition: number) {
    //If there is yet to be an owner of the table, the owner is set to the player
    if (!this.ownerOfTable) this.ownerOfTable = player;

    const seat = this.players[seatPosition];
    if (seat.name === '') {
      this.players[seatPosition] = player;
      player.isReadyToPlay = true;
    }
    if (this.players.length > 0) this.sendUpdates();
  }

  public deletePlayer(player: Player, seatPosition: number) {
    this.players[seatPosition] = new Player('');
    this.sendUpdates();
  }

  //Returns the number of players connected to the table
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
