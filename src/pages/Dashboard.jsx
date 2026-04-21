import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Users, Video } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const Dashboard = () => {
  const [meetings, setMeetings] = useState([]);
  const [stats, setStats] = useState({
    totalMeetings: 0,
    totalHours: 0,
    totalParticipants: 0
  });

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/meetings/history');
      setMeetings(response.data);
      setStats({
        totalMeetings: response.data.length,
        totalHours: response.data.reduce((acc, m) => acc + (m.duration || 0), 0),
        totalParticipants: response.data.reduce((acc, m) => acc + (m.participants?.length || 0), 0)
      });
    } catch (error) {
      console.error('Error fetching meetings:', error);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={<Video className="w-8 h-8 text-blue-500" />}
            title="Total Meetings"
            value={stats.totalMeetings}
          />
          <StatCard
            icon={<Clock className="w-8 h-8 text-green-500" />}
            title="Hours Spent"
            value={`${stats.totalHours}h`}
          />
          <StatCard
            icon={<Users className="w-8 h-8 text-purple-500" />}
            title="Participants"
            value={stats.totalParticipants}
          />
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-4">Recent Meetings</h2>
          <div className="space-y-3">
            {meetings.map((meeting, index) => (
              <MeetingCard key={index} meeting={meeting} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="bg-gray-800 rounded-xl p-6"
  >
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-gray-400">{title}</h3>
      {icon}
    </div>
    <p className="text-3xl font-bold">{value}</p>
  </motion.div>
);

const MeetingCard = ({ meeting }) => (
  <div className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
    <div>
      <h3 className="font-semibold">{meeting.meetingName}</h3>
      <p className="text-sm text-gray-400">{new Date(meeting.createdAt).toLocaleDateString()}</p>
    </div>
    <div className="flex items-center gap-2">
      <Clock className="w-4 h-4 text-gray-400" />
      <span className="text-sm">{meeting.duration || 0} min</span>
    </div>
  </div>
);

export default Dashboard;