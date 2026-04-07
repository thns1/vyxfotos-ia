import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import ClientArea from './pages/ClientArea';
import Checkout from './pages/Checkout';
import ThankYou from './pages/ThankYou';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/cliente" element={<ClientArea />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/obrigado" element={<ThankYou />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
