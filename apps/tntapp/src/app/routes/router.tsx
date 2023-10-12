import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { InitialPage } from '../pages/initial-page/index';
import { TablePage } from '../pages/table-page/index';
import { LobbyPage } from '../pages/table.lobby-page/table.lobby-page';
import { RulesPage } from '../pages/rules-page';

const router = createBrowserRouter([
  {
    path: '/',
    element: <InitialPage />,
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
