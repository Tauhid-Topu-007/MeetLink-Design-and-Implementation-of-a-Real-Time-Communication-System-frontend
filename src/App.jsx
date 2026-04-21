import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Home as HomeIcon, Calendar, Users, Video, LayoutDashboard, LogOut, FolderOpen } from 'lucide-react';
import Home from './pages/Home';
import JoinMeeting from './pages/JoinMeeting';
import CreateMeeting from './pages/CreateMeeting';
import MeetingRoom from './components/MeetingRoom';
import Dashboard from './pages/Dashboard';
import Scheduler from './pages/Scheduler';
import Contacts from './pages/Contacts';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import Recordings from './pages/Recordings';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('displayName');
    setIsAuthenticated(false);
    setUser(null);
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        {/* Navigation Bar */}
        <nav className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Zoom Clone
              </Link>
              <div className="flex items-center gap-4">
                <NavLink to="/" icon={<HomeIcon className="w-4 h-4" />} text="Home" />
                <NavLink to="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />} text="Dashboard" />
                <NavLink to="/scheduler" icon={<Calendar className="w-4 h-4" />} text="Schedule" />
                <NavLink to="/contacts" icon={<Users className="w-4 h-4" />} text="Contacts" />
                <NavLink to="/recordings" icon={<FolderOpen className="w-4 h-4" />} text="Recordings" />
                <div className="flex items-center gap-3 ml-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">{user?.displayName || user?.username}</div>
                    <div className="text-xs text-gray-400">{user?.email}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 hover:bg-gray-700 rounded-lg transition"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/join" element={<JoinMeeting />} />
          <Route path="/create" element={<CreateMeeting />} />
          <Route path="/meeting/:meetingId" element={<MeetingRoom />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/scheduler" element={<Scheduler />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/recordings" element={<Recordings />} />
          <Route path="/login" element={<Navigate to="/" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

const NavLink = ({ to, icon, text }) => (
  <Link
    to={to}
    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-700 transition"
  >
    {icon}
    <span className="hidden sm:inline">{text}</span>
  </Link>
);

export default App;