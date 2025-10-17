import { useEffect, useRef, useState } from "react";
import { useGetPrices } from "../../context/getPricesContext";
import "./styles.css";
import InputTicket from "./InputTicket";

const QuickBuy= () => {
    const {prices}=useGetPrices();
    const selectValue=useRef(1);
    const [ticketValue, setTicketValue]=useState(1);
    

    const ticketPrices = [1,2,5,10,20]; // Prices for 1, 2, 3, 5, 10, 20 tickets respectively

    const handleChage = () => {
        setTicketValue(selectValue.current.value);
    }

  return (
     /* Quick Buy Section  */
            <div className="glass-card rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-4 orbitron">Quick Buy Tickets</h3>
                <div id="quick-buy-form" className="space-y-4">
                    <div className={ticketValue>1?"grid grid-cols-1 md:grid-cols-2 gap-4":"grid grid-cols-1 gap-4"}>
                        
                       <InputTicket ticketValue={ticketValue} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Number of Tickets</label>
                        <select ref={selectValue} className="input-field w-full px-4 py-3 rounded-lg" id="ticket-count" onChange={()=>handleChage()}>
                            {ticketPrices.map((price, index) => (
                                <option key={index} value={price}>
                                    {price} Ticket{price > 1 ? 's' : ''} - {price +' TonCoin'} {prices.ton?`($${(price * prices.ton).toFixed(2)})`:'' }
                                </option>
                            ))}
                           
                        </select>
                    </div>
                    <button type="submit"
                        className="buy-button w-full py-4 rounded-lg text-white font-bold text-lg orbitron pulse-glow">
                        BUY TICKETS NOW
                    </button>
                </div>
            </div>
  )
}

export default QuickBuy
