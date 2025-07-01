import React, { useContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './AuthContext';
import Interviews from './pages/Interviews';
import NewInterview from './pages/NewInterview';
import Questions from './pages/Questions';
import NavBar from './components/NavBar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import Hero from './pages/Hero';
import ContactModal from './components/ContactModal';
import LoginModal from './pages/Login';
import RegisterModal from './pages/Register';
import Profile from './pages/Profile';
import Footer from './components/Footer';

const PrivateRoute = ({ children }) => {
  const { token } = useContext(AuthContext);
  return token ? children : null;
};

function App() {
  const [showContact, setShowContact] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  return (
    <AuthProvider>
      <Router>
        <NavBar
          onContactClick={() => setShowContact(true)}
          onLoginClick={() => setShowLogin(true)}
          onRegisterClick={() => setShowRegister(true)}
        />
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          <Route path="/" element={<Hero onRegisterClick={() => setShowRegister(true)} />} />
          <Route path="/interviews" element={<PrivateRoute><Interviews /></PrivateRoute>} />
          <Route path="/new-interview" element={<PrivateRoute><NewInterview /></PrivateRoute>} />
          <Route path="/questions/:id" element={<PrivateRoute><Questions /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <ContactModal open={showContact} onClose={() => setShowContact(false)} />
        <LoginModal open={showLogin} onClose={() => setShowLogin(false)} onRegisterLink={() => { setShowLogin(false); setShowRegister(true); }} />
        <RegisterModal open={showRegister} onClose={() => setShowRegister(false)} onLoginLink={() => { setShowRegister(false); setShowLogin(true); }} />
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App; 