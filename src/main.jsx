import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from "react-router";
import { GetPricesProvider } from './context/getPricesContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <BrowserRouter>
        <GetPricesProvider>
           <App />
        </GetPricesProvider>
      </BrowserRouter>
  </StrictMode>,
)
