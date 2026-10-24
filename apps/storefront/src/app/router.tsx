import { createBrowserRouter } from 'react-router'
import { RootLayout } from '../components/layout/root-layout'
import HomePage from '../pages/home'
import NotFoundPage from '../pages/not-found'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
