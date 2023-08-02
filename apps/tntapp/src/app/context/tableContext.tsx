// we use context to share data between components
import React, { createContext, useContext, useState } from 'react';

type TableContextValue = [
  string[],
  React.Dispatch<React.SetStateAction<string[]>>
];

const TableContext = createContext<TableContextValue>([[], () => []]);

export const useTableContext = () => useContext(TableContext);

export function TableProvider({ children }: { children: React.ReactNode }) {
  const [tableIDs, setTableIDs] = useState<string[]>([]);

  return (
    <TableContext.Provider value={[tableIDs, setTableIDs]}>
      {children}
    </TableContext.Provider>
  );
}
