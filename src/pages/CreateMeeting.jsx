import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';

const CreateMeeting = () => {
  const navigate = useNavigate();
  const [meetingName, setMeetingName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateMeeting = async () => {
    if (!meetingName.trim()) {
      toast.error('Please enter a meeting name');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/meetings/create', {
        meetingName,
        password: password || null,
        createdBy: 'user_' + Math.random().toString(36).substr(2, 9)
      });
      
      const { meetingId } = response.data;
      toast.success('Meeting created successfully!');
      navigate(`/meeting/${meetingId}`, { state: { isCreator: true, meetingName, password, displayName: 'You' } });
    } catch (error) {
      toast.error('Failed to create meeting');
      console.error(error);
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
      </motion.div>
    </div>
  );
};

export default CreateMeeting;