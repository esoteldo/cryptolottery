
import Main from "./pages/Main.jsx"
import {  Routes, Route } from "react-router";
import Tickets from "./pages/Tickets/index.jsx";
import Results from "./pages/Results";
import Refer from "./pages/Refer";
import TermsConditions from "./pages/TermsConditions.jsx";
import BottonMenu from "./components/BottonMenu/index.jsx";
import Header from "./components/Header/index.jsx";
import ShareModal from "./components/ShareModal/index.jsx";


function App() {

  return (
    <>
    <Header />
      <Routes>
        <Route path="/:idReferal" element={<Main />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/results" element={<Results />} />
        <Route path="/referral" element={<Refer />} />
        <Route path="/terms-conditions" element={<TermsConditions />} />
        <Route path="*" element={<Main />} />
      </Routes>
      <BottonMenu />
    </>
  )
}

export default App
