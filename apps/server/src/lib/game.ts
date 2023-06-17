import { Table } from "./types";

let tables: Table[] = []; 

export function getTable(id:string) : Table{
  const table = tables.find(table => table.id === id);
  return table ? table : null;
}

export function createTable(id:string): Table {
const newTable = { 
  id: id,
  players: [], 
  lastPlayedCards: null,
  deck: [],
  discard: []
};
  return newTable;
}
export function deleteTable(id:string) {
 tables = tables.filter(table => table.id !== id);
}
// TODO 
// export function playCard(table:Table, player:Player, card:Card): Table{
//   //get table and play the card 
  


  
//   return table;
// } 