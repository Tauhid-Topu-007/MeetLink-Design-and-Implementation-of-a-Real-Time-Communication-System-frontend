import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Copy, Check, RefreshCw } from 'lucide-react';

const CreateMeeting = () => {
  const navigate = useNavigate();
  const [meetingName, setMeetingName] = useState('');
  const [meetingId, setMeetingId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate random meeting ID
  const generateRandomMeetingId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 9; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setMeetingId(result);
  };

  // Copy meeting ID to clipboard
  const copyToClipboard = () => {
    if (meetingId) {
      navigator.clipboard.writeText(meetingId);
      setCopied(true);
      toast.success('Meeting ID copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCreateMeeting = async () => {
    if (!meetingName.trim()) {
      toast.error('Please enter a meeting name');
      return;
    }
    
    if (!meetingId.trim()) {
      toast.error('Please enter or generate a meeting ID');
      return;
    }

    // Validate meeting ID format (alphanumeric, 6-12 characters)
    const meetingIdRegex = /^[A-Z0-9]{6,12}$/i;
    if (!meetingIdRegex.test(meetingId.trim())) {
      toast.error('Meeting ID must be 6-12 alphanumeric characters');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/meetings/create', {
        meetingId: meetingId.trim().toUpperCase(),
        meetingName: meetingName.trim(),
        password: password || null,
        createdBy: 'user_' + Math.random().toString(36).substr(2, 9)
      });
      
      if (response.data.success) {
        toast.success('Meeting created successfully!');
        navigate(`/meeting/${meetingId.trim().toUpperCase()}`, { 
          state: { 
            isCreator: true, 
            meetingName: meetingName.trim(), 
            password,
            displayName: 'You',
            meetingId: meetingId.trim().toUpperCase()
          } 
        });
      }
    } catch (error) {
      if (error.response?.data?.message === 'Meeting ID already exists') {
        toast.error('This Meeting ID is already taken. Please use a different one.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to create meeting');
      }
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
        <h2 className="text-3xl font-bold mb-6 text-center">Create Meeting</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Meeting Name</label>
            <input
              type="text"
              value={meetingName}
              onChange={(e) => setMeetingName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter meeting name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Meeting ID</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={meetingId}
                onChange={(e) => setMeetingId(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                placeholder="Enter custom ID or generate"
                maxLength="12"
              />
              <button
                type="button"
                onClick={generateRandomMeetingId}
                className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition"
                title="Generate random meeting ID"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Enter a custom ID (6-12 characters) or click the refresh button for a random one
            </p>
          </div>
          
          {meetingId && (
            <div className="flex items-center gap-2 p-2 bg-gray-700 rounded-lg">
              <div className="flex-1 text-center">
                <span className="text-xs text-gray-400 block">Your Meeting ID</span>
                <code className="font-mono text-lg font-bold">{meetingId.toUpperCase()}</code>
              </div>
              <button
                onClick={copyToClipboard}
                className="p-2 hover:bg-gray-600 rounded transition"
                title="Copy meeting ID"
              >
                {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-2">Password (Optional)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Set meeting password"
            />
          </div>
          
          <button
            onClick={handleCreateMeeting}
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create Meeting'}
          </button>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Already have a meeting ID?{' '}
            <button
              onClick={() => navigate('/join')}
              className="text-green-500 hover:underline"
            >
              Join a meeting
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateMeeting;