import "./styles.css";
import {QRCodeSVG} from 'qrcode.react';

const Refer = () => {

  return (
        /* Hero Section  */
    <div className="min-h-screen relative">
      
        
         {/*  Main Content  */}
        <div className="p-4 space-y-6 mt-15">
                {/*  Header */}
          <header className="p-4 relative z-10">
              <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                     {/*  <a href="index.html" className="text-white hover:text-orange-400 transition-colors">
                          ← Back
                      </a> */}
                      <h1 className="text-xl font-bold orbitron">Referral Program</h1>
                  </div>
                  <div className="text-sm text-gray-300">
                      <span className="tier-badge" id="tier-badge">BRONZE</span>
                  </div>
              </div>
          </header>

          {/*  Referral Link Section */} 
          <div className="p-4">
              <div className="glass-card rounded-2xl p-6 mb-6 text-center">
                  <h2 className="text-lg font-semibold mb-4 text-gray-300">Your Referral Link</h2>
                  <div className="referral-link rounded-lg p-4 mb-4 text-sm" id="referral-link">
                      https://cryptolottery.app/ref/USER123XYZ
                  </div>
                  <div className="flex space-x-3 mb-4">
                      <button className="copy-button flex-1 py-3 rounded-lg text-white font-bold" onClick={()=>{}}  >
                          📋 Copy Link
                      </button>
                      <button className="share-button px-6 py-3 rounded-lg" onClick={()=>{}} >
                          📤 Share
                      </button>
                  </div>
                  <div className="qr-container mx-auto">
                      <QRCodeSVG
                        value={'https://cryptolottery.app/ref/USER123XYZ'}
                        size={170} // Size of the QR code in pixels
                        level="H" // Error correction level (L, M, Q, H)
                        bgColor="#FFFFFF" // Background color
                        fgColor="#000000" // Foreground color
                         />
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                      Scan QR code to share instantly
                  </div>
              </div>
          </div>

           {/* Statistics Dashboard  */}
          <div className="p-4 pb-2">
              <div className="glass-card rounded-2xl p-4 mb-4">
                  <h3 className="text-lg font-bold mb-4 orbitron">Your Referral Stats</h3>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="stat-card glass-card rounded-xl">
                          <div className="stat-value orbitron" id="total-referrals">24</div>
                          <div className="text-sm text-gray-400">Total Referrals</div>
                      </div>
                      <div className="stat-card glass-card rounded-xl">
                          <div className="stat-value orbitron commission-earned" id="total-earnings">$186.50</div>
                          <div className="text-sm text-gray-400">Commission Earned</div>
                      </div>
                  </div>

                  {/*  Progress to Next Tier  */}
                  <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-300">Progress to Silver Tier</span>
                          <span className="text-sm font-bold" id="tier-progress">24/50</span>
                      </div>
                      <div className="progress-bar">
                          <div className="progress-fill" /* style="width: 48%" */ id="progress-fill"></div>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">Get 5% commission at Silver tier</div>
                  </div>

                  {/* <div className="chart-container" id="earnings-chart"></div> */}
              </div>
          </div>

           {/* Referral Tiers */}
          <div className="p-4 pb-2">
              <div className="glass-card rounded-2xl p-4 mb-4">
                  <h3 className="text-lg font-bold mb-4 orbitron">Referral Tiers</h3>
                  <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-950 bg-opacity-5 rounded-lg">
                          <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center text-xs font-bold">🥉</div>
                              <div>
                                  <div className="font-semibold">Bronze</div>
                                  <div className="text-xs text-gray-400">0-49 referrals</div>
                              </div>
                          </div>
                          <div className="text-right">
                              <div className="font-bold">3%</div>
                              <div className="text-xs text-gray-400">commission</div>
                          </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-800 bg-opacity-5 rounded-lg">
                          <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-xs font-bold">🥈</div>
                              <div>
                                  <div className="font-semibold">Silver</div>
                                  <div className="text-xs text-gray-400">50-99 referrals</div>
                              </div>
                          </div>
                          <div className="text-right">
                              <div className="font-bold">5%</div>
                              <div className="text-xs text-gray-400">commission</div>
                          </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-950 bg-opacity-5 rounded-lg overline:bg-gray-700">
                          <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold">🥇</div>
                              <div>
                                  <div className="font-semibold">Gold</div>
                                  <div className="text-xs text-gray-400">100+ referrals</div>
                              </div>
                          </div>
                          <div className="text-right">
                              <div className="font-bold">7%</div>
                              <div className="text-xs text-gray-400">commission</div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>

            {/* Recent Referrals  */}
          <div className="p-4 pt-0 mb-10">
              <div className="glass-card rounded-2xl p-4 mb-4">
                  <h3 className="text-lg font-bold mb-4 orbitron">Recent Referrals</h3>
                  <div className="space-y-3" id="referrals-list">
                       {/* Referrals will be populated by JavaScript  */}
                  </div>

                  <div className="text-center mt-4">
                      <button className="load-more bg-gray-800 bg-opacity-10 hover:bg-opacity-40 px-6 py-3 rounded-lg font-medium transition-all" id="load-more-referrals">
                          Load More
                      </button>
                  </div>
              </div>
          </div>
      </  div>

    </div>
  ) 
} 

export default Refer