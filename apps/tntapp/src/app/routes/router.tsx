import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { InitialPage } from '../pages/initial-page/index';
import { TablePage } from '../pages/table-page/index';
import { LobbyPage } from '../pages/table.lobby-page/table.lobby-page';
import { RulesPage } from '../pages/rules-page';

// Create a router with defined routes
const router = createBrowserRouter([
  {
    path: '/', // Route path for the initial page
    element: <InitialPage />, // Element to render for the initial page
  },
  {
    path: '/table/:id',
    element: <TablePage />,
  },
  {
    path: '/table/lobby/:id',
    element: <LobbyPage />,
  },
  {
    path: '/rules',
    element: <RulesPage />,
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
