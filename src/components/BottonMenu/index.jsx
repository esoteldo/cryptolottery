import { NavLink } from "react-router";
import "./styles.css"

const BottonMenu = () => {
    console.log("Renderizando BottonMenu");
  return (
     /* Bottom Navigation */
    <nav className="fixed bottom-0 left-0 right-0 bg-black bg-opacity-80 backdrop-blur-lg border-t border-gray-800 z-50">
        <div className="flex justify-around py-3">
            <NavLink to="/"  className="nav-tab active flex flex-col items-center space-y-1" end>
                <div className="w-6 h-6 flex items-center justify-center">🏠</div>
                <span className="text-xs">Lottery</span>
            </NavLink>
            <NavLink to="/tickets" className="nav-tab flex flex-col items-center space-y-1" end>
                <div className="w-6 h-6 flex items-center justify-center">🎫</div>
                <span className="text-xs">Tickets</span>
            </NavLink>
            <NavLink to="/results"  className="nav-tab flex flex-col items-center space-y-1" end>
                <div className="w-6 h-6 flex items-center justify-center">🏆</div>
                <span className="text-xs">Results</span>
            </NavLink>
            <NavLink to="/referral" className="nav-tab flex flex-col items-center space-y-1" end>
                <div className="w-6 h-6 flex items-center justify-center">🔗</div>
                <span className="text-xs">Refer</span>
            </NavLink>
        </div>
    </nav>
    
  )
}

export default BottonMenu