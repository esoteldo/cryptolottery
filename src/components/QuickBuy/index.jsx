import { useRef, useState } from "react";
import { Link } from "react-router";
import { useGetPrices } from "../../context/getPricesContext";
import { useGetTelegramData } from "../../context/getTelegramDataContext";
import { useTonConnect } from "../../hooks/useTonConnect";
import { createTransaction, createTransactionIntent } from "../../api/data";
import { buildLotteryCommentPayload } from "../../helpers/buildCommentPayload";
import { toNano } from "@ton/core";
import "./styles.css";
import InputTicket from "./InputTicket";

// Wallet que recibe los pagos (debe coincidir con WALLET_ADDRESS del backend).
// Etapa 5: cutover a lottery wallet dedicada. La direccion anterior
// (0QAjBeSS-...) era la wallet unica de Etapas 3-4.
const LOTTERY_WALLET = import.meta.env.VITE_LOTTERY_WALLET || "0QBigX_0lt-QVRdCzwVq0ZcmWbUTzqLpdnF2Do-VfEct4MLh";

const QuickBuy = () => {
    const { prices } = useGetPrices();
    const { userData } = useGetTelegramData();
    const { connected, connectionRestored, walletAddress, sendTransaction, connectWallet, disconnectWallet } = useTonConnect();

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

        const ticketsPayload = tickets.map(t => ({ btc: t.btc, eth: t.eth }));
        const amountInNano = toNano(ticketValue.toString()); // 1 TON por ticket

        // 1. Crear intent PRE-firma. Si falla aqui no se firma nada,
        //    asi que mostramos error normal sin riesgo de plata perdida.
        let intent;
        try {
            const intentRes = await createTransactionIntent({
                senderWallet: walletAddress,
                expectedValueTon: ticketValue,
                tickets: ticketsPayload
            });
            intent = intentRes.data;
        } catch (error) {
            console.error("Error creating intent:", error);
            setBuyResult('error');
            setBuying(false);
            return;
        }

        // 2. Firmar TX con payload que lleva el nonce. Si el user cancela aqui,
        //    el intent queda pending y expira solo en 10 min (TTL Mongo).
        let signResult;
        try {
            const payload = buildLotteryCommentPayload(intent.nonce);
            signResult = await sendTransaction(
                LOTTERY_WALLET,
                amountInNano.toString(),
                payload
            );
        } catch (error) {
            console.error("Error signing TX:", error);
            if (error.message?.includes('Cancelled') || error.message?.includes('cancel')) {
                setBuyResult(null); // User cancelled, no error.
            } else {
                setBuyResult('error');
            }
            setBuying(false);
            return;
        }

        // 3. POST /transaction con el nonce. Si esto falla, la TX YA esta on-chain
        //    y el cron recoverOrphanTransactions del backend la recuperara
        //    automaticamente (parsea el comment, encuentra el intent, crea
        //    Transaccion + Tickets retroactivamente). UX: mostramos "processing"
        //    en vez de error, porque la compra es valida y se reflejara en
        //    minutos cuando el cron corra.
        try {
            await createTransaction({
                boc: signResult.boc,
                lt: Date.now().toString(),
                value: ticketValue.toString(),
                senderWallet: walletAddress,
                idUser: userData.id?.toString() || '',
                tickets: ticketsPayload,
                nonce: intent.nonce
            });
            setBuyResult('success');
        } catch (error) {
            console.error("Error POST /transaction (orphan recovery la procesara):", error);
            setBuyResult('processing');
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
                {buyResult === 'processing' && (
                    <div className="text-center p-3 bg-yellow-900 bg-opacity-30 rounded-lg border border-yellow-500">
                        <div className="text-yellow-400 font-bold">Payment received, processing...</div>
                        <div className="text-xs text-gray-400 mt-1">
                            Your transaction is on-chain. Tickets will appear in a few minutes
                            once our system reconciles the payment. No action needed.
                        </div>
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
                    disabled={buying || !connectionRestored || (connected && !termsAccepted)}
                    className="buy-button w-full py-4 rounded-lg text-white font-bold text-lg orbitron pulse-glow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {buying ? 'PROCESSING...' :
                        !connectionRestored ? 'RESTORING WALLET...' :
                        connected ? 'BUY TICKETS NOW' : 'CONNECT WALLET'}
                </button>

                <label className="flex items-center justify-center gap-2 text-xs text-gray-300 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="w-4 h-4 accent-orange-500 cursor-pointer"
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
