export class getBinancePrice {
  prices;
  precioBtc;
  precioEth;
  precioTon;
  setPricesCallback;

  constructor(setPrices) {
    this.precioBtc = 0;
    this.precioEth = 0;
    this.precioTon = 0;
    this.setPricesCallback = setPrices;

    this.prices = new WebSocket("wss://stream.binance.com:9443/stream?streams=btcusdt@trade/ethusdt@trade/tonusdt@trade");

    this.prices.onmessage = (event) => {
      const trade = JSON.parse(event.data);

      if (trade.stream === 'btcusdt@trade') {
        this.precioBtc = trade.data.p;
      }
      if (trade.stream === 'ethusdt@trade') {
        this.precioEth = trade.data.p;
      }
      if (trade.stream === 'tonusdt@trade') {
        this.precioTon = trade.data.p;
      }

      this.setPricesCallback({
        btc: Number(this.precioBtc).toFixed(2),
        eth: Number(this.precioEth).toFixed(2),
        ton: Number(this.precioTon).toFixed(2)
      });
    };

    this.prices.onerror = (error) => {
      console.log('Error en la conexión Binance:', error);
    };
  }

  getPrices(setPrices) {
    setPrices({
      btc: Number(this.precioBtc).toFixed(2),
      eth: Number(this.precioEth).toFixed(2),
      ton: Number(this.precioTon).toFixed(2)
    });
  }
}
