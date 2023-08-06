import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { InitialPage } from '../pages/initial-page/index';
import { TablePage } from '../pages/table-page/index';

const router = createBrowserRouter([
  {
    path: '/',
    element: <InitialPage />,
  },
  {
    path: '/table/:id',
    element: <TablePage />,
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
