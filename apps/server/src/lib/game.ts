import { Table } from './table';

let tables: Table[] = [];

//locating table based on Table ID
export function getTable(id: string): Table | null {
  const table = tables.find((table) => table.id === id);
  return table ? table : null;
}

//creating a new table
export function createTable(id: string): Table {
  const newTable = new Table(id);
  tables.push(newTable);
  return newTable;
}
//deleting a table
export function deleteTable(id: string) {
  tables = tables.filter((table) => table.id !== id);
}
