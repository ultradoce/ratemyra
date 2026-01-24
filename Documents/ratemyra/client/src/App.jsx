import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import RASearch from './pages/RASearch';
import RADetail from './pages/RADetail';
import SubmitReview from './pages/SubmitReview';
import AddRA from './pages/AddRA';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Help from './pages/Help';
import Guidelines from './pages/Guidelines';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import VerifyEmail from './pages/VerifyEmail';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<RASearch />} />
            <Route path="/add-ra" element={<AddRA />} />
            <Route path="/ra/:id" element={<RADetail />} />
            <Route path="/ra/:id/review" element={<SubmitReview />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/help" element={<Help />} />
            <Route path="/guidelines" element={<Guidelines />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
