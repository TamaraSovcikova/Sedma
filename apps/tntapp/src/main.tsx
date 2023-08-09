import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { UserContextProvider } from './app/components/auth/auth-context';
import App from './app/app';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StrictMode>
    <UserContextProvider>
      <App />
    </UserContextProvider>
  </StrictMode>
);
