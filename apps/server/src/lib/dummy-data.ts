import { createTable } from './game';
import { addPlayer } from './table';

export function createDummyData() {
  const table1 = createTable('table1');
  const table2 = createTable('table2');
  const table3 = createTable('table3');

  addPlayer('Tinky-Winky', table2, 0);
  addPlayer('Dipsy', table2, 2);
  addPlayer('Lalla', table3, 0);
  addPlayer('Poe', table3, 1);
  addPlayer('Foxxy', table3, 2);
  addPlayer('Bagetka', table3, 3);
}
