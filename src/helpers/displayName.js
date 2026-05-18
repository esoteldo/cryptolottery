/**
 * Helpers de display de usuario.
 *
 * Telegram puede no tener @username (no es obligatorio). first_name casi
 * siempre existe. La wallet truncada es el ultimo fallback porque es
 * lo unico siempre presente para users que hicieron una compra.
 *
 * Casos manejados:
 *   - User con alias y wallet:    "@enrique"
 *   - User con first_name solo:   "Enrique"
 *   - User solo wallet:           "0QBzOK...-1d8"
 *   - User sin nada (legacy):     "Anonymous"
 */

/**
 * Devuelve el nombre mostrable del user.
 * @param {{username?: string|null, firstName?: string|null, wallet?: string|null}} u
 * @returns {string}
 */
export function displayUser(u) {
    if (!u) return 'Anonymous';
    if (u.username) return `@${u.username}`;
    if (u.firstName) return u.firstName;
    if (u.wallet) return u.wallet.slice(0, 6) + '...' + u.wallet.slice(-4);
    return 'Anonymous';
}

/**
 * Devuelve la inicial del display name (1-2 chars) para el avatar circular.
 * Prioriza la primera letra de username/firstName; cae a wallet si no hay.
 * @param {{username?: string|null, firstName?: string|null, wallet?: string|null}} u
 * @returns {string}
 */
export function displayInitials(u) {
    if (!u) return '?';
    if (u.username) return u.username.slice(0, 2).toUpperCase();
    if (u.firstName) return u.firstName.slice(0, 2).toUpperCase();
    if (u.wallet) return u.wallet.slice(0, 2).toUpperCase();
    return '?';
}
