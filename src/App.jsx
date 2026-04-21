import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import JoinMeeting from './pages/JoinMeeting';
import CreateMeeting from './pages/CreateMeeting';
import MeetingRoom from './components/MeetingRoom';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/join" element={<JoinMeeting />} />
          <Route path="/create" element={<CreateMeeting />} />
          <Route path="/meeting/:meetingId" element={<MeetingRoom />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;