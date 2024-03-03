import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

// Defining type for UserContext
interface UserContextType {
  token?: string;
  setToken: (token?: string) => void;
  logout: () => void;
  tableId?: string;
  setTableId: (tableId?: string) => void;
}

// Custom hook to use authentication context
export const useAuth = () => {
  const context = useContext(UserContext); // Using context hook
  return (
    context ?? {
      token: undefined,
      setToken: (token?: string) => {
        /*empty*/
      },
      logout: () => {
        /*empty*/
      },
      tableId: undefined,
      setTableId: (tableId?: string) => {
        /*empty*/
      },
    }
  );
};

// Creating UserContext
const UserContext = createContext<UserContextType | undefined>(undefined);

function storeToken(token: string) {
  localStorage.setItem('userToken', token);
}

function deleteToken() {
  localStorage.removeItem('userToken');
}

function storeTableId(tableId: string) {
  localStorage.setItem('tableId', tableId);
}

function deleteTableId() {
  localStorage.removeItem('tableId');
}

// UserContextProvider component
export const UserContextProvider: React.FC<{
  children: ReactNode | ReactNode[];
}> = ({ children }) => {
  const [token, setToken] = useState<string>();
  const [tableId, setTableId] = useState<string>();

  useEffect(() => {
    const storedToken = localStorage.getItem('userToken'); // Retrieving token from localStorage
    if (storedToken) {
      setToken(storedToken);
    }
    const storedTableId = localStorage.getItem('tableId'); // Retrieving table ID from localStorage
    if (storedTableId) {
      setTableId(storedTableId);
    }
  }, []); // Running effect only on mount

  return (
    <UserContext.Provider
      value={{
        token,
        setToken: (token?: string) => {
          setToken(token);
          if (token) {
            storeToken(token);
          } else {
            deleteToken();
          }
        },
        logout: () => {
          deleteToken(); // Deleting token from localStorage
          setToken(undefined); // Clearing token state
          deleteTableId(); // Deleting table ID from localStorage
        },
        tableId,
        setTableId: (tableId?: string) => {
          setTableId(tableId);
          if (tableId) {
            storeTableId(tableId);
          } else {
            deleteTableId();
          }
        },
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
