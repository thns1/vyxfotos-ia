import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import ClientArea from './pages/ClientArea';
import Checkout from './pages/Checkout';
import Plans from './pages/Plans';
import ThankYou from './pages/ThankYou';
import Privacy from './pages/Privacy';
import Contact from './pages/Contact';
import ChatWidget from './components/ChatWidget';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/cliente" element={<ClientArea />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/planos" element={<Plans />} />
        <Route path="/obrigado" element={<ThankYou />} />
        <Route path="/privacidade" element={<Privacy />} />
        <Route path="/contato" element={<Contact />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ChatWidget />
    </Router>
  );
}
