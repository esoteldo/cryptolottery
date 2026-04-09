import { useRef, useState } from "react";
import { Link } from "react-router";
import { useGetPrices } from "../../context/getPricesContext";
import { useGetTelegramData } from "../../context/getTelegramDataContext";
import { useTonConnect } from "../../hooks/useTonConnect";
import { createTransaction } from "../../api/data";
import { toNano } from "@ton/core";
import "./styles.css";
import InputTicket from "./InputTicket";

// Wallet que recibe los pagos (debe coincidir con WALLET_ADDRESS del backend)
const LOTTERY_WALLET = import.meta.env.VITE_LOTTERY_WALLET || "0QAjBeSS-O4t5gr5hGCjypzo92DMSex793cYFa4XLifDBMrm";

const QuickBuy = () => {
    const { prices } = useGetPrices();
    const { userData } = useGetTelegramData();
    const { connected, walletAddress, sendTransaction, connectWallet, disconnectWallet } = useTonConnect();

    const selectValue = useRef(1);
    const [ticketValue, setTicketValue] = useState(1);
    const [tickets, setTickets] = useState([]);
    const [buying, setBuying] = useState(false);
    const [buyResult, setBuyResult] = useState(null);
    const [termsAccepted, setTermsAccepted] = useState(false);

    const ticketPrices = [1, 2, 5, 10, 20];

    const handleChange = () => {
        setTicketValue(Number(selectValue.current.value));
    }

    const handleTicketsChange = (newTickets) => {
        setTickets(newTickets);
    }

    const handleBuy = async () => {
        if (!connected) {
            connectWallet();
            return;
        }

        if (tickets.length === 0) return;

        setBuying(true);
        setBuyResult(null);

        try {
            // 1. Enviar transaccion TON via wallet
            const amountInNano = toNano(ticketValue.toString()); // 1 TON por ticket

            const result = await sendTransaction(
                LOTTERY_WALLET,
                amountInNano.toString()
            );

            // 2. Registrar en el backend
            await createTransaction({
                boc: result.boc,
                lt: Date.now().toString(),
                value: ticketValue.toString(),
                senderWallet: walletAddress,
                idUser: userData.id?.toString() || '',
                tickets: tickets.map(t => ({
                    btc: t.btc,
                    eth: t.eth
                }))
            });

            setBuyResult('success');

        } catch (error) {
            console.error("Error buying tickets:", error);
            if (error.message?.includes('Cancelled') || error.message?.includes('cancel')) {
                setBuyResult(null); // User cancelled, no error
            } else {
                setBuyResult('error');
            }
        } finally {
            setBuying(false);
        }
    }

    return (
        <div className="glass-card rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-4 orbitron">Quick Buy Tickets</h3>
            <div id="quick-buy-form" className="space-y-4">
                <div className={ticketValue > 1 ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "grid grid-cols-1 gap-4"}>
                    <InputTicket ticketValue={ticketValue} onTicketsChange={handleTicketsChange} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Number of Tickets</label>
                    <select ref={selectValue} className="input-field w-full px-4 py-3 rounded-lg" id="ticket-count" onChange={handleChange}>
                        {ticketPrices.map((price, index) => (
                            <option key={index} value={price}>
                                {price} Ticket{price > 1 ? 's' : ''} - {price + ' TonCoin'} {prices.ton ? `($${(price * prices.ton).toFixed(2)})` : ''}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Wallet status */}
                {connected && walletAddress && (
                    <div className="text-xs text-gray-400 text-center flex items-center justify-center gap-2">
                        <span>Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
                        <button
                            type="button"
                            onClick={disconnectWallet}
                            className="px-2 py-1 rounded border border-red-500 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                            title="Disconnect wallet"
                        >
                            Disconnect
                        </button>
                    </div>
                )}

                {/* Buy result messages */}
                {buyResult === 'success' && (
                    <div className="text-center p-3 bg-green-900 bg-opacity-30 rounded-lg border border-green-500">
                        <div className="text-green-400 font-bold">Tickets purchased successfully!</div>
                        <div className="text-xs text-gray-400 mt-1">Transaction is being confirmed on the blockchain...</div>
                    </div>
                )}
                {buyResult === 'error' && (
                    <div className="text-center p-3 bg-red-900 bg-opacity-30 rounded-lg border border-red-500">
                        <div className="text-red-400 font-bold">Transaction failed</div>
                        <div className="text-xs text-gray-400 mt-1">Please try again</div>
                    </div>
                )}

                <button
                    onClick={handleBuy}
                    disabled={buying || (connected && !termsAccepted)}
                    className="buy-button w-full py-4 rounded-lg text-white font-bold text-lg orbitron pulse-glow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {buying ? 'PROCESSING...' :
                        connected ? 'BUY TICKETS NOW' : 'CONNECT WALLET'}
                </button>

                <label className="flex items-start gap-2 text-xs text-gray-300 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="mt-0.5 w-4 h-4 accent-orange-500 cursor-pointer"
                    />
                    <span>
                        I accept the{' '}
                        <Link
                            to="/terms-conditions"
                            className="text-orange-400 hover:text-orange-300 underline"
                        >
                            Terms and Conditions
                        </Link>
                    </span>
                </label>
            </div>
        </div>
    )
}

export default QuickBuy
