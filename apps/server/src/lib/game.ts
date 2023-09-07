import { Table } from './table';

let tables: Table[] = [];

export function getTable(id: string): Table | null {
  const table = tables.find((table) => table.id === id);
  return table ? table : null;
}

export function createTable(id: string): Table {
  const newTable = new Table(id);
  tables.push(newTable);
  return newTable;
}
export function deleteTable(id: string) {
  tables = tables.filter((table) => table.id !== id);
}
