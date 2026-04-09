import { StrictMode, useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from "react-router";
import { GetPricesProvider } from './context/getPricesContext.jsx'
import { GetTelegramDataProvider } from './context/getTelegramDataContext.jsx'
import { GetInitDataProvider } from './context/getInitDataContext.jsx';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

const manifestUrl = new URL('tonconnect-manifest.json', window.location.href).toString();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TonConnectUIProvider
      manifestUrl={manifestUrl}
      actionsConfiguration={{ twaReturnUrl: 'https://t.me/cryptolotteryappbot/CryptoLottery' }}
    >
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <GetTelegramDataProvider>
              <GetInitDataProvider>
                    <GetPricesProvider>
                       <App />
                    </GetPricesProvider>
              </GetInitDataProvider>
        </GetTelegramDataProvider>
      </BrowserRouter>
    </TonConnectUIProvider>
  </StrictMode>
)
