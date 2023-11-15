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
  | 'gameData';

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
  stakesReached: boolean;
  playAgain: boolean;
  isFirstDeal: number;
  winningTeamPoints: number;
  ownerOfTableId: string;
  finalStakeCount: number;
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

export type SuitType = 'heart' | 'leaf' | 'acorn' | 'bell';
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
