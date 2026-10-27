import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// The react-router/dom build wires ReactDOM.flushSync (used by sign-out)
import { RouterProvider } from 'react-router/dom'
import { Providers } from './app/providers'
import { router } from './app/router'
import './styles/globals.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </StrictMode>,
)
