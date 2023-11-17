import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

interface UserContextType {
  token?: string;
  setToken: (token?: string) => void;
  logout: () => void;
  tableId?: string;
  setTableId: (tableId?: string) => void;
}
export const useAuth = () => {
  const context = useContext(UserContext);
  return (
    context ?? {
      token: undefined,
      setToken: (token?: string) => {
        /*empty*/
      },
      logout: () => {
        /*empty*/
      },
      setTableId: (tableId?: string) => {
        /*empty*/
      },
    }
  );
};

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

export const UserContextProvider: React.FC<{
  children: ReactNode | ReactNode[];
}> = ({ children }) => {
  const [token, setToken] = useState<string>();
  const [tableId, setTableId] = useState<string>();

  useEffect(() => {
    const storedToken = localStorage.getItem('userToken');
    if (storedToken) {
      setToken(storedToken);
    }
    const storedTableId = localStorage.getItem('tableId');
    if (storedTableId) {
      setTableId(storedTableId);
    }
  }, []);

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
          deleteToken();
          setToken(undefined);
          deleteTableId();
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
