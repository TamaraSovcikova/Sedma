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
}
export const useAuth = () => {
  const context = useContext(UserContext);
  return (
    context ?? {
      token: undefined,
      setToken: (token?: string) => {
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

export const UserContextProvider: React.FC<{
  children: ReactNode | ReactNode[];
}> = ({ children }) => {
  const [token, setToken] = useState<string>();

  useEffect(() => {
    const storedToken = localStorage.getItem('userToken');
    if (storedToken) {
      setToken(storedToken);
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
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
