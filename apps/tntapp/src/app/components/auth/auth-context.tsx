import { v4 as uuidv4 } from 'uuid';
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

interface UserContextType {
  token: string;
  setToken: (token: string) => void;
}
export const useAuthToken = () => {
  const context = useContext(UserContext);
  return context?.token;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserContextProvider: React.FC<{
  children: ReactNode | ReactNode[];
}> = ({ children }) => {
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    const storedToken = localStorage.getItem('userToken');
    if (storedToken) {
      setToken(storedToken);
    } else {
      const newToken = uuidv4();
      setToken(newToken);
      localStorage.setItem('userToken', newToken);
    }
  }, []);

  return (
    <UserContext.Provider value={{ token, setToken }}>
      {children}
    </UserContext.Provider>
  );
};
