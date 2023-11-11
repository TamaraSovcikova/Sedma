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
  | 'chatMessage';

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
  ownerOfTableId: string;
  gameInProgress: boolean;
  winningPlayerId: string;
  leadPlayerId: string;
  round: number;
  cardToBeat: CardData;
  teamWonRound: string;
  wonPoints: number;
  showresults: boolean;
  gameEnd: boolean;
  teamAPoints: number;
  teamBPoints: number;
  teamAStakeCount: number;
  teamBStakeCount: number;
  finalStakeCount: number;
  askContinue: boolean;
  stakesReached: boolean;
  playAgain: boolean;
  isFirstDeal: number;
}

export interface MessageTableData extends MessageBase {
  data: TableData;
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
