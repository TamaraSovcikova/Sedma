import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { InitialPage } from './pages/initial-page';
import { LobbyPage } from './pages/lobby-page';
import { TablePage } from './pages/table-page';

const router = createBrowserRouter([
  {
    path: '/',
    element: <InitialPage />,
  },
  {
    path: '/lobby',
    element: <LobbyPage />,
  },
  {
    path: '/table/:id',
    element: <TablePage />,
  },
]);

export function App() {
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
