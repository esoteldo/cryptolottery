import React from 'react'

const HowToPlay
 = () => {
  return (
    <div className="glass-card rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-4 orbitron">How to Play</h3>
                <div className="space-y-3 text-sm text-gray-300">
                    <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</div>
                        <span>Predict the last 2 digits(decimal number) of Bitcoin and Ethereum price</span>
                    </div>
                    <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</div>
                        <span>Buy tickets with your predictions (00-99 for each crypto) Bitcoin and Ethereun price</span>
                    </div>
                    <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</div>
                        <span>Win if your numbers match the actual price endings!</span>
                    </div>
                    <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">4</div>
                        <span>If there is no winner, the prize accumulates for the next draw.</span>
                    </div>
                </div>
            </div>
  )
}

export default HowToPlay
