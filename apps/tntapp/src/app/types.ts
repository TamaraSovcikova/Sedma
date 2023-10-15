import { CardData } from '@tnt-react/ws-messages';

export interface Player {
  name: string;
  hand: CardData[];
  lastPlayedCard?: CardData;
  id: string;
}

export interface Table {
  players: Player[];
  deck: CardData[];
  discard: CardData[];
  tableId: string;
}
