import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';

const JoinMeeting = () => {
  const navigate = useNavigate();
  const [meetingId, setMeetingId] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinMeeting = async () => {
    if (!meetingId.trim() || !displayName.trim()) {
      toast.error('Please enter meeting ID and your name');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/meetings/join', {
        meetingId,
        password: password || null,
        participantName: displayName
      });
      
      if (response.data.success) {
        toast.success('Joined meeting successfully!');
        navigate(`/meeting/${meetingId}`, { state: { isCreator: false, displayName, password } });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join meeting');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800 rounded-2xl p-8 max-w-md w-full"
      >
        <h2 className="text-3xl font-bold mb-6 text-center">Join Meeting</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Meeting ID</label>
            <input
              type="text"
              value={meetingId}
              onChange={(e) => setMeetingId(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter 9-digit meeting ID"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Your Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Password (If required)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Meeting password"
            />
          </div>
          
          <button
            onClick={handleJoinMeeting}
            disabled={isLoading}
            className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {isLoading ? 'Joining...' : 'Join Meeting'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default JoinMeeting;