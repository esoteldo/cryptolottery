import { NavLink } from "react-router";
import "./styles.css"

const LotteryIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    <path d="M2 12h20"/>
    <path d="M9.5 5.5L14.5 18.5"/>
  </svg>
);

const TicketsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7v4a1 1 0 0 0 1 1 2 2 0 0 1 0 4 1 1 0 0 0-1 1v4h18v-4a1 1 0 0 0-1-1 2 2 0 0 1 0-4 1 1 0 0 0 1-1V7H3z"/>
    <path d="M9 7v10" strokeDasharray="2 2"/>
  </svg>
);

const ResultsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 7 7 7 7"/>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 17 7 17 7"/>
    <path d="M4 22h16"/>
    <path d="M10 22V10a2 2 0 0 0-2-2H6v0a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v0h-2a2 2 0 0 0-2 2v12"/>
    <path d="M12 15l-2-2 2-2 2 2-2 2z"/>
  </svg>
);

const ReferIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const BottonMenu = () => {
  const navClass = ({ isActive }) =>
    `nav-tab flex flex-col items-center space-y-1 ${isActive ? 'active' : ''}`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/85 backdrop-blur-xl border-t border-gray-800/60 z-50">
        <div className="flex justify-around py-1 px-2">
            <NavLink to="/" className={navClass} end>
                <div className="nav-icon"><LotteryIcon /></div>
                <span className="nav-label">Lottery</span>
            </NavLink>
            <NavLink to="/tickets" className={navClass} end>
                <div className="nav-icon"><TicketsIcon /></div>
                <span className="nav-label">Tickets</span>
            </NavLink>
            <NavLink to="/results" className={navClass} end>
                <div className="nav-icon"><ResultsIcon /></div>
                <span className="nav-label">Results</span>
            </NavLink>
            <NavLink to="/referral" className={navClass} end>
                <div className="nav-icon"><ReferIcon /></div>
                <span className="nav-label">Refer</span>
            </NavLink>
        </div>
    </nav>
  )
}

export default BottonMenu