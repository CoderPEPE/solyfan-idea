import { Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Demo from './pages/Demo';
import Badge from './pages/Badge';
import Storie from './pages/Storie';
import Group from './pages/Group';
import Socialaccount from './pages/Socialaccount';
import Password from './pages/Password';
import AccountInfo from './pages/AccountInfo';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import Forgot from './pages/Forgot';
import Notfound from './pages/Notfound';
import Comingsoon from './pages/Comingsoon';
import Notification from './pages/Notification';
import Email from './pages/Email';
import Message from './pages/Message';
import Live from './pages/Live';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Shopone from './pages/Shopone';
import Shoptwo from './pages/Shoptwo';
import Payment from './pages/Payment';
import Contactinfo from './pages/Contactinfo';
import Video from './pages/Video';
import GroupPage from './pages/Grouppage';
import Userpage from './pages/Userpage';
import Authorpage from './pages/Authorpage';
import Eventpage from './pages/Eventpage';
import Jobpage from './pages/Jobpage';
import Hotelpage from './pages/Hotelpage';
import Hotelsingle from './pages/Hotelsingle';
import Helpbox from './pages/Helpbox';
import Eamilopen from './pages/Eamilopen';
import Singleproduct from './pages/Singleproduct';
import Analytic from './pages/Analytic';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';



const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/notfound" element={<Notfound />} />
        <Route path="/comingsoon" element={<Comingsoon />} />
        <Route path="/demo" element={<Demo />} />
        
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/defaultbadge" element={<ProtectedRoute><Badge /></ProtectedRoute>} />
        <Route path="/defaultstorie" element={<ProtectedRoute><Storie /></ProtectedRoute>} />
        <Route path="/defaultgroup" element={<ProtectedRoute><Group /></ProtectedRoute>} />
        <Route path="/socialaccount" element={<ProtectedRoute><Socialaccount /></ProtectedRoute>} />
        <Route path="/password" element={<ProtectedRoute><Password /></ProtectedRoute>} />
        <Route path="/accountinformation" element={<ProtectedRoute><AccountInfo /></ProtectedRoute>} />
        <Route path="/defaultsettings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/defaultnotification" element={<ProtectedRoute><Notification /></ProtectedRoute>} />
        <Route path="/defaultemailbox" element={<ProtectedRoute><Email /></ProtectedRoute>} />
        <Route path="/defaultmessage" element={<ProtectedRoute><Message /></ProtectedRoute>} />
        <Route path="/defaultlive" element={<ProtectedRoute><Live /></ProtectedRoute>} />

        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/shop1" element={<ProtectedRoute><Shopone /></ProtectedRoute>} />
        <Route path="/shop2" element={<ProtectedRoute><Shoptwo /></ProtectedRoute>} />

        <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />    
        <Route path="/contactinformation" element={<ProtectedRoute><Contactinfo /></ProtectedRoute>} />    
        <Route path="/defaultvideo" element={<ProtectedRoute><Video /></ProtectedRoute>} />
        <Route path="/grouppage" element={<ProtectedRoute><GroupPage /></ProtectedRoute>} /> 
        <Route path="/userpage" element={<ProtectedRoute><Userpage /></ProtectedRoute>} />
        <Route path="/authorpage" element={<ProtectedRoute><Authorpage /></ProtectedRoute>} /> 

        <Route path="/defaultevent" element={<ProtectedRoute><Eventpage /></ProtectedRoute>} /> 
        <Route path="/defaultjob" element={<ProtectedRoute><Jobpage /></ProtectedRoute>} /> 
        <Route path="/defaulthotel" element={<ProtectedRoute><Hotelpage /></ProtectedRoute>} /> 
        <Route path="/defaulthoteldetails" element={<ProtectedRoute><Hotelsingle /></ProtectedRoute>} /> 
        <Route path="/helpbox" element={<ProtectedRoute><Helpbox /></ProtectedRoute>} /> 
        <Route path="/defaultemailopen" element={<ProtectedRoute><Eamilopen /></ProtectedRoute>} /> 
        <Route path="/singleproduct" element={<ProtectedRoute><Singleproduct /></ProtectedRoute>} />
        <Route path="/defaultanalytics" element={<ProtectedRoute><Analytic /></ProtectedRoute>} />
        

      </Routes>
    </AuthProvider>
  );
};

export default App;
