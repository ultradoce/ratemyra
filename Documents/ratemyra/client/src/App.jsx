import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import Home from './pages/Home';
import RASearch from './pages/RASearch';
import RADetail from './pages/RADetail';
import SubmitReview from './pages/SubmitReview';
import AddRA from './pages/AddRA';
import Help from './pages/Help';
import Guidelines from './pages/Guidelines';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import VerifyEmail from './pages/VerifyEmail';
import EditReview from './pages/EditReview';
// Lazy load admin dashboard (less frequently accessed)
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="App">
          <Header />
          <main>
            <Suspense fallback={<LoadingSpinner fullScreen size="large" />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<RASearch />} />
                <Route path="/add-ra" element={<AddRA />} />
                <Route path="/ra/:id" element={<RADetail />} />
                <Route path="/ra/:id/review" element={<SubmitReview />} />
                <Route path="/review/:id/edit" element={<EditReview />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/help" element={<Help />} />
                <Route path="/guidelines" element={<Guidelines />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
