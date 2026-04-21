import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Copy, Check } from 'lucide-react';

const JoinMeeting = () => {
  const navigate = useNavigate();
  const [meetingId, setMeetingId] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate a random meeting ID for demo purposes
  const generateRandomMeetingId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 9; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setMeetingId(result);
  };

  const copyToClipboard = () => {
    if (meetingId) {
      navigator.clipboard.writeText(meetingId);
      setCopied(true);
      toast.success('Meeting ID copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleJoinMeeting = async () => {
    if (!meetingId.trim()) {
      toast.error('Please enter a meeting ID');
      return;
    }
    if (!displayName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/meetings/join', {
        meetingId: meetingId.trim().toUpperCase(),
        password: password || null,
        participantName: displayName
      });
      
      if (response.data.success) {
        toast.success('Joined meeting successfully!');
        navigate(`/meeting/${meetingId}`, { 
          state: { 
            isCreator: false, 
            displayName, 
            password,
            meetingName: response.data.data.meetingName 
          } 
        });
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
            <div className="flex gap-2">
              <input
                type="text"
                value={meetingId}
                onChange={(e) => setMeetingId(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                placeholder="Enter 9-digit meeting ID (e.g., ABC123XYZ)"
              />
              <button
                onClick={generateRandomMeetingId}
                className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition text-sm"
                title="Generate random meeting ID"
              >
                Random
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Example: ABC123XYZ (9 characters)
            </p>
          </div>
          
          {meetingId && (
            <div className="flex items-center gap-2 p-2 bg-gray-700 rounded-lg">
              <code className="flex-1 text-center font-mono text-lg">{meetingId}</code>
              <button
                onClick={copyToClipboard}
                className="p-1 hover:bg-gray-600 rounded transition"
                title="Copy meeting ID"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          )}
          
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
              placeholder="Meeting password (optional)"
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
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Don't have a meeting ID?{' '}
            <button
              onClick={() => navigate('/create')}
              className="text-blue-500 hover:underline"
            >
              Create a new meeting
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default JoinMeeting;