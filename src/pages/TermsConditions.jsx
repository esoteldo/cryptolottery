const TermsConditions = () => {
  return (
    <div className="min-h-screen relative">
      <div className="p-4 space-y-6 mt-20 mb-20">
        <header className="p-4 relative z-10">
          <h1 className="text-2xl font-bold orbitron">Terms & Conditions</h1>
          <p className="text-sm text-gray-400 mt-1">Last updated: April 2026</p>
        </header>

        <div className="p-4">
          <div className="glass-card rounded-2xl p-6 space-y-6 text-sm text-gray-300 leading-relaxed">

            <section>
              <h2 className="text-lg font-bold text-white mb-2">1. General</h2>
              <p>By using CryptoLottery, you agree to these terms. CryptoLottery is a decentralized lottery application operating on the TON blockchain. Participation is voluntary and at your own risk.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">2. Eligibility</h2>
              <p>You must be at least 18 years old to participate. It is your responsibility to ensure that participating in a cryptocurrency lottery is legal in your jurisdiction. CryptoLottery does not operate in jurisdictions where such activities are prohibited.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">3. How It Works</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>Each ticket costs 1 TON.</li>
                <li>Players select the last 2 decimal digits (00-99) for Bitcoin and Ethereum prices.</li>
                <li>Draws occur daily at 8:00 PM UTC.</li>
                <li>Winning numbers are determined by the last 2 decimal digits of the actual BTC and ETH prices at draw time.</li>
                <li>If there are no winners, the prize pool accumulates to the next draw.</li>
                <li>If there are multiple winners, the prize pool is split equally.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">4. Payments & Transactions</h2>
              <p>All payments are processed on the TON blockchain. Transactions are irreversible once confirmed on the blockchain. CryptoLottery is not responsible for failed transactions due to insufficient funds, network congestion, or incorrect wallet addresses.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">5. Referral Program</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>Bronze Tier (0-19 referrals): 1% commission.</li>
                <li>Silver Tier (20-49 referrals): 3% commission.</li>
                <li>Gold Tier (50+ referrals): 5% commission.</li>
              </ul>
              <p className="mt-2">Commissions are calculated on ticket purchases made by referred users.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">6. Limitation of Liability</h2>
              <p>CryptoLottery is provided "as is" without warranties. We are not liable for losses arising from blockchain network issues, smart contract vulnerabilities, price feed inaccuracies, or any other circumstances beyond our control.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">7. Privacy</h2>
              <p>We collect your Telegram user ID and wallet address to provide the service. We do not collect personal identification data beyond what is required for operation. Transaction data is publicly visible on the TON blockchain.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">8. Changes</h2>
              <p>We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the updated terms.</p>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}

export default TermsConditions
