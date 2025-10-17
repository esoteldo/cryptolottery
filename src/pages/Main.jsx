import "../assets/style/home.css"
import BottonMenu from "../components/BottonMenu"
import Header from "../components/Header"
import HowToPlay from "../components/HowToPlay"
import PrizePool from "../components/PrizePool"
import QuickBuy from "../components/QuickBuy"
import RecentWinners from "../components/RecentWinners"


const Main = () => {
  return (
    <>
    {/* <!-- Particle Background --> */}
    <div id="particles-canvas"></div>
    
    {/* <!-- Hero Section --> */}
    <div className="min-h-screen relative">

        
        
        {/* <!-- Main Content --> */}
        <div className="p-4 space-y-6 mt-20">

             {/* <!-- Prize Pool --> */}
             <PrizePool />

             {/* <!-- Quick Buy Section --> */} 
             <QuickBuy />
            

             {/* <!-- Recent Winners --> */}
            <RecentWinners />
            

            {/* <!-- How to Play --> */}
            <HowToPlay />

        </div>

        {/* <!-- Bottom padding for navigation --> */}
        <div className="h-20"></div>
    </div>

    

    {/* <!-- Bottom Navigation 
    <nav className="fixed bottom-0 left-0 right-0 bg-black bg-opacity-80 backdrop-blur-lg border-t border-gray-800 z-50">
        <div className="flex justify-around py-3">
            <a href="index.html" className="nav-tab active flex flex-col items-center space-y-1">
                <div className="w-6 h-6 flex items-center justify-center">🏠</div>
                <span className="text-xs">Lottery</span>
            </a>
            <a href="tickets.html" className="nav-tab flex flex-col items-center space-y-1">
                <div className="w-6 h-6 flex items-center justify-center">🎫</div>
                <span className="text-xs">Tickets</span>
            </a>
            <a href="results.html" className="nav-tab flex flex-col items-center space-y-1">
                <div className="w-6 h-6 flex items-center justify-center">🏆</div>
                <span className="text-xs">Results</span>
            </a>
            <a href="referral.html" className="nav-tab flex flex-col items-center space-y-1">
                <div className="w-6 h-6 flex items-center justify-center">🔗</div>
                <span className="text-xs">Refer</span>
            </a>
        </div>
    </nav>
     --> */}
    {/* <!-- Success Modal --> */}
    <div id="success-modal" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
        <div className="glass-card rounded-2xl p-6 m-4 max-w-sm w-full text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-bold mb-2 orbitron">Tickets Purchased!</h3>
            <p className="text-gray-300 mb-4">Your lottery tickets have been successfully purchased. Good luck!</p>
            <button /* onclick="closeModal()" */ className="buy-button w-full py-3 rounded-lg text-white font-bold">
                Continue
            </button>
        </div>
    </div>


    </>
  )
}

export default Main