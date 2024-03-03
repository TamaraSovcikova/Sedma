// Define the possible types of messages that can be exchanged between client and server
type MessageType =
  | 'login'
  | 'playCard'
  | 'tableData'
  | 'loginFailure'
  | 'error'
  | 'startGame'
  | 'endRound'
  | 'closeResults'
  | 'closeEndGameResults'
  | 'handleStakesNotReached'
  | 'handleStakesReached'
  | 'handleLeave'
  | 'forcePlayerDisconnect'
  | 'chatMessage'
  | 'showResults'
  | 'showEndGameResults'
  | 'askGameContinue'
  | 'gameData'
  | 'startingGame'
  | 'stakesReached'
  | 'letsPlayAgain'
  | 'disconnectingPlayer'
  | 'playerStay';

export interface MessageBase {
  type: MessageType;
  tableId: string;
}

export interface MessageLogin extends MessageBase {
  token: string;
}

export interface MessagePlayCard extends MessageBase {
  card: CardData;
  token?: string;
}
export interface MessagePlayerIdx extends MessageBase {
  playerIdx: number;
}
export interface MessageForcePlayerDisconnect {
  type: 'forcePlayerDisconnect';
}

export interface MessageChat extends MessageBase {
  username: string;
  message: string;
}

export interface Message {
  username: string;
  message: string;
}

// Define the structure of table data representing the state of the table
export interface TableData {
  players: { name: string; id: string | undefined; bodyColor: string }[];
  hand: CardData[];
  lastPlayedCards: CardData[];
  waitingForPlayers: boolean;
  currentPlayer: number;
  gameInProgress: boolean;
  winningPlayerId: string;
  leadPlayerId: string;
  round: number;
  cardToBeat: CardData;
  teamWonRound: string;
  wonPoints: number;
  teamAStakeCount: number;
  teamBStakeCount: number;
  isFirstDeal: number;
  winningTeamPoints: number;
  ownerOfTableId: string;
  finalStakeCount: number;
  everyoneReady: boolean;
}

export interface GameData {
  finalStakeCount: number;
  ownerOfTableId: string;
}

export interface MessageTableData extends MessageBase {
  data: TableData;
}

export interface MessageGameData extends MessageBase {
  data: GameData;
}

export interface MessageError extends MessageBase {
  error: string;
}

// Define the possible types of suits for a card
export type SuitType = 'heart' | 'leaf' | 'acorn' | 'bell';
// Define the possible types of faces for a card
export type FaceType =
  | 'seven'
  | 'eight'
  | 'nine'
  | 'ten'
  | 'lower'
  | 'upper'
  | 'king'
  | 'ace';

export interface CardData {
  suit: SuitType;
  face: FaceType;
}
