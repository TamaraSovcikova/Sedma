import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { InitialPage } from '../pages/initial-page/index';
import { TablePage } from '../pages/table-page/index';
import { LoginPage } from '../pages/login-page/login-page';

const router = createBrowserRouter([
  {
    path: '/',
    element: <InitialPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/table/:id',
    element: <TablePage />,
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
