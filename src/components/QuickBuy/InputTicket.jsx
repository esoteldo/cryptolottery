import  { useEffect, useState } from 'react'

const InputTicket = ({ ticketValue}) => {
    console.log('rendering InputTicket');
    const getRandomValue = () => {
        return {
            btc: Math.floor(Math.random() * 100),
            eth: Math.floor(Math.random() * 100)
        }
    }

    const [ticket, setTicket] = useState([getRandomValue()]);
    
    useEffect(() => {
        // create an array with ticketValue random tickets and set it once
        if (ticketValue > 0) {
            const newTickets = Array.from({ length: ticketValue }, () => getRandomValue());
            setTicket(newTickets);
            /* console.log(newTickets); */
        }
    }, [ticketValue]);
    
    const handleTicketChange = (index, currency, value) => {
        const newTickets = [...ticket];
        const numValue = Math.max(0, Math.min(99, Number(value)));
        if (!isNaN(numValue)) {
            newTickets[index][currency] = numValue;
            setTicket(newTickets);
        }
        console.log(newTickets);
    }
  return (
    <>
     {ticket.map((t, index) => (
                <div key={index} className="mb-4 ticket-card border border-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-bold mb-2 text-white">Ticket #{index + 1}</h3>
                    <div className="grid  grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block  text-sm font-medium mb-2 text-gray-300">Bitcoin Last 2 Digits</label>
                        <input
                            type="number"
                            min="0"
                            max="99"
                            value={t.btc}
                            onChange={(e) => handleTicketChange(index, 'btc', e.target.value)}
                            placeholder="42"
                            className="input-field w-full px-4 mb-5 py-3 rounded-lg jetbrains text-center text-lg"
                            id={`bitcoin-digits-${index}`}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Ethereum Last 2 Digits</label>
                        <input
                            type="number"
                            min="0"
                            max="99"
                            value={t.eth}
                            onChange={(e) => handleTicketChange(index, 'eth', e.target.value)}
                            placeholder="23"
                            className="input-field w-full px-4 py-3 rounded-lg jetbrains text-center text-lg"
                            id={`ethereum-digits-${index}`}
                        />
                    </div>
                    </div>
                </div>
            ))}
    </>
  )
}

export default InputTicket