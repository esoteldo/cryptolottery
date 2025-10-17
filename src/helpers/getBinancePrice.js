export const getBinancePrice = class {
  // btc and eth will hold WebSocket instances
  prices;
  precioBtc;
  precioEth;
  precioTon;
  setBtcPrice;
  setEthPrice;
  setTonPrice;
  getBtcPrice;
  getEthPrice;
    getTonPrice;

  constructor(setPrices) {
    
    this.prices =new WebSocket("wss://stream.binance.com:9443/stream?streams=btcusdt@trade/ethusdt@trade/tonusdt@trade");
    this.precioBtc = 0;
    this.precioEth = 0;
    this.precioTon = 0;
    this.setBtcPrice = (precioBtc) => {
      this.precioBtc = precioBtc;
        
    }
    this.setEthPrice = (precioEth) => {
      this.precioEth = precioEth;
    }
    this.setTonPrice = (precioTon) => {
      this.precioTon = precioTon;
    }
    this.getBtcPrice = () => this.precioBtc;
    this.getEthPrice = () => this.precioEth;
    this.getTonPrice = () => this.precioTon;
    
    getBinancePrice.getBinancePrice(this.prices, this.setBtcPrice, this.setEthPrice,this.setTonPrice);
    getBinancePrice.setBinancePrice(this.precioBtc, this.precioEth,this.precioTon, setPrices);
  }

  
   static async getBinancePrice(
    prices,
    setBtcPrice,
    setEthPrice,
    setTonPrice
  ) {

    prices.onmessage = (event) => {
      const trade = JSON.parse(event.data);
       
       if(trade.stream==='btcusdt@trade'){
    setBtcPrice(trade.data.p);
     }
     if(trade.stream==='ethusdt@trade'){
       setEthPrice(trade.data.p);
     }
     if(trade.stream==='tonusdt@trade'){
       setTonPrice(trade.data.p);
     }
       }; 

    prices.onerror = (error) => {
      console.log('Error en la conexión Binance:', error);
      
    };
    
  }

   static setBinancePrice(
    precioBtc,
    precioEth,
    precioTon,
    setPrices) {

      setPrices({ btc: Number(precioBtc).toFixed(2), eth: Number(precioEth).toFixed(2), ton: Number(precioTon).toFixed(2) });
      
  }

  getPrices(setPrices) {
    setPrices({ btc: Number(this.precioBtc).toFixed(2), eth: Number(this.precioEth).toFixed(2), ton: Number(this.precioTon).toFixed(2) });
    
  }
};