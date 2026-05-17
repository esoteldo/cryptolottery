/**
 * Construye el payload TonConnect para incluir un text comment en una TX.
 *
 * Formato estandar TON:
 *   cell = beginCell()
 *            .storeUint(0, 32)        // opcode 0 = text comment
 *            .storeStringTail(text)
 *          .endCell()
 *   payload = cell.toBoc().toString('base64')
 *
 * Lo recibe TonConnect en el campo `payload` de cada mensaje. El cron
 * recoverOrphanTransactions del backend (Etapa 6.2) lo parsea para extraer
 * el nonce "lot:<32hex>" y reclamar el TransactionIntent.
 *
 * Validacion: el text estandar TON cabe en una sola cell hasta ~127 bytes
 * (1023 bits / 8). Nuestro "lot:<32hex>" son 36 bytes, sobra espacio.
 */
import { beginCell } from '@ton/core';

export function buildLotteryCommentPayload(nonce) {
    if (!/^[a-f0-9]{32}$/.test(nonce)) {
        throw new Error('Invalid nonce: must be 32 lowercase hex chars');
    }
    const text = `lot:${nonce}`;
    const cell = beginCell()
        .storeUint(0, 32)
        .storeStringTail(text)
        .endCell();
    return cell.toBoc().toString('base64');
}
