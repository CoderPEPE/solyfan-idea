import { Routes, Route } from "react-router-dom"
import Home from "./pages/home"
import Payment from "./pages/payment"
import Account from "./pages/account"
import Default from "./pages/default"
import Default_analytics from "./pages/default_analytics"
import Default_settings from "./pages/default_settings"
import Social from "./pages/social"
import AuthPage from "./pages/auth"

function App() {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/auth' element={<AuthPage />} />
      <Route path='/payment' element={<Payment />} />
      <Route path='/account' element={<Account />} />
      <Route path='/default' element={<Default />} />
      <Route path='/social' element={<Social />} />
      <Route path='/default/analytics' element={<Default_analytics />} />
      <Route path='/default/settings' element={<Default_settings />} />
    </Routes>
  )
}

export default App
