import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from "react-router";
import { GetPricesProvider } from './context/getPricesContext.jsx'
// import { GetTelegramDataProvider } from './context/getTelegramDataContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <BrowserRouter>
        {/* <GetTelegramDataProvider> */}
              <GetPricesProvider>
                 <App />
              </GetPricesProvider>
        {/* </GetTelegramDataProvider> */}
      </BrowserRouter>
  </StrictMode>,
)
