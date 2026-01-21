import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import AIReceptionist from './components/AIReceptionist';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Book from './pages/Book';
import Studios from './pages/Studios';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Beats from './pages/Beats';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-12 text-center">
          <div>
            <h1 className="text-4xl text-red-500 font-display font-bold mb-4">CRITICAL ERROR</h1>
            <p className="text-gray-400 mb-8">{this.state.error?.message || 'Something went wrong'}</p>
            <button onClick={() => window.location.reload()} className="bg-gold text-black px-8 py-3 rounded-full font-bold">RELOAD APP</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <div className="min-h-screen bg-black text-white selection:bg-gold selection:text-black">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/studios" element={<Studios />} />

            <Route path="/book" element={<Book />} />
            <Route path="/beats" element={<Beats />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
          <AIReceptionist />
        </div>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
