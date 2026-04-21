import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Home as HomeIcon, Calendar, Users, Video, LayoutDashboard } from 'lucide-react';
import Home from './pages/Home';
import JoinMeeting from './pages/JoinMeeting';
import CreateMeeting from './pages/CreateMeeting';
import MeetingRoom from './components/MeetingRoom';
import Dashboard from './pages/Dashboard';
import Scheduler from './pages/Scheduler';
import Contacts from './pages/Contacts';

function App() {
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
              <div className="flex gap-4">
                <NavLink to="/" icon={<HomeIcon className="w-4 h-4" />} text="Home" />
                <NavLink to="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />} text="Dashboard" />
                <NavLink to="/scheduler" icon={<Calendar className="w-4 h-4" />} text="Schedule" />
                <NavLink to="/contacts" icon={<Users className="w-4 h-4" />} text="Contacts" />
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