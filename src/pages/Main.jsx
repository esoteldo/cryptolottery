import "../assets/style/home.css"
import HowToPlay from "../components/HowToPlay"
import PrizePool from "../components/PrizePool"
import QuickBuy from "../components/QuickBuy"
import RecentWinners from "../components/RecentWinners"

const Main = () => {

  return (
    <>
    <div id="particles-canvas"></div>

    <div className="min-h-screen relative">

        <div className="p-4 space-y-6 mt-20">

             <PrizePool />

             <QuickBuy />

            <RecentWinners />

            <HowToPlay />

        </div>

        <div className="h-20"></div>
    </div>
    </>
  )
}

export default Main
