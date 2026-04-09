import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { Address } from '@ton/core';

export const useTonConnect = () => {
    const [tonConnectUI] = useTonConnectUI();
    const wallet = useTonWallet();

    const connected = !!wallet;

    const walletAddress = wallet?.account?.address
        ? Address.parse(wallet.account.address).toString()
        : null;

    const sendTransaction = async (toAddress, amount, payload) => {
        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 5 * 60, // 5 minutes
            messages: [
                {
                    address: toAddress,
                    amount: amount, // in nanoTON
                    ...(payload ? { payload } : {})
                }
            ]
        };

        const result = await tonConnectUI.sendTransaction(transaction);
        return result;
    };

    const connectWallet = () => {
        tonConnectUI.openModal();
    };

    const disconnectWallet = () => {
        tonConnectUI.disconnect();
    };

    return {
        connected,
        wallet,
        walletAddress,
        tonConnectUI,
        sendTransaction,
        connectWallet,
        disconnectWallet
    };
};
