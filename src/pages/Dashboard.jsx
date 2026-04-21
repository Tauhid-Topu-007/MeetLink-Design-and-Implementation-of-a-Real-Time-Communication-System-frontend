import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, Video, TrendingUp, Award, Star, Activity, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalMeetings: 0,
    totalHours: 0,
    totalParticipants: 0,
    averageDuration: 0,
    upcomingMeetings: 0,
    activeMeetings: 0
  });
  
  const [recentMeetings, setRecentMeetings] = useState([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [activeMeetings, setActiveMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    fetchDashboardData();
    loadScheduledMeetings();
    loadUserName();
  }, []);

  const loadUserName = () => {
    const name = localStorage.getItem('displayName') || 'Guest';
    setUserName(name);
  };

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch meeting history from server
      const historyResponse = await axios.get('http://localhost:5000/api/meetings/history');
      const meetings = historyResponse.data.data || historyResponse.data || [];
      
      // Fetch active meetings
      const activeResponse = await axios.get('http://localhost:5000/api/meetings/active');
      const active = activeResponse.data.data?.meetings || activeResponse.data.data || [];
      
      // Calculate statistics
      const totalMeetings = meetings.length;
      const totalHours = meetings.reduce((sum, m) => sum + (m.duration || 0), 0);
      const totalParticipants = meetings.reduce((sum, m) => sum + (m.participantsCount || 0), 0);
      const averageDuration = totalMeetings > 0 ? Math.round(totalHours / totalMeetings) : 0;
      
      setStats({
        totalMeetings,
        totalHours,
        totalParticipants,
        averageDuration,
        upcomingMeetings: upcomingMeetings.length,
        activeMeetings: active.length
      });
      
      setRecentMeetings(meetings.slice(0, 5));
      setActiveMeetings(active);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to localStorage data
      loadLocalData();
    } finally {
      setIsLoading(false);
    }
  };

  const loadLocalData = () => {
    // Load from localStorage as fallback
    const localMeetings = JSON.parse(localStorage.getItem('scheduledMeetings') || '[]');
    const completedMeetings = localMeetings.filter(m => new Date(m.datetime) < new Date());
    const upcoming = localMeetings.filter(m => new Date(m.datetime) > new Date());
    
    setStats(prev => ({
      ...prev,
      totalMeetings: completedMeetings.length,
      upcomingMeetings: upcoming.length
    }));
    
    setRecentMeetings(completedMeetings.slice(0, 5));
    setUpcomingMeetings(upcoming);
  };

  const loadScheduledMeetings = () => {
    const saved = localStorage.getItem('scheduledMeetings');
    if (saved) {
      const meetings = JSON.parse(saved);
      const upcoming = meetings.filter(m => new Date(m.datetime) > new Date());
      setUpcomingMeetings(upcoming);
    }
  };

  const joinMeeting = (meetingId) => {
    window.location.href = `/meeting/${meetingId}`;
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '0 min';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins} min`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">{userName}!</span>
          </h1>
          <p className="text-gray-400">Here's what's happening with your meetings today.</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatCard
            icon={<Video className="w-8 h-8 text-blue-500" />}
            title="Total Meetings"
            value={stats.totalMeetings}
            trend="+12%"
            color="blue"
          />
          <StatCard
            icon={<Clock className="w-8 h-8 text-green-500" />}
            title="Hours Spent"
            value={stats.totalHours}
            subtitle="hours"
            trend="+8%"
            color="green"
          />
          <StatCard
            icon={<Users className="w-8 h-8 text-purple-500" />}
            title="Participants"
            value={stats.totalParticipants}
            trend="+23%"
            color="purple"
          />
          <StatCard
            icon={<Activity className="w-8 h-8 text-orange-500" />}
            title="Active Meetings"
            value={stats.activeMeetings}
            subtitle="ongoing"
            color="orange"
          />
        </motion.div>

        {/* Second Row Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Average Meeting Duration</h3>
              <Award className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="text-3xl font-bold">{formatDuration(stats.averageDuration)}</div>
            <p className="text-sm text-blue-200 mt-2">per meeting</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Upcoming Meetings</h3>
              <Calendar className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold">{stats.upcomingMeetings}</div>
            <p className="text-sm text-purple-200 mt-2">scheduled</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Completion Rate</h3>
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold">
              {stats.totalMeetings > 0 ? Math.round((stats.totalMeetings - stats.upcomingMeetings) / stats.totalMeetings * 100) : 0}%
            </div>
            <p className="text-sm text-green-200 mt-2">meetings completed</p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Meetings */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800 rounded-xl p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Meetings
              </h2>
              <Link to="/scheduler" className="text-sm text-blue-500 hover:underline flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="space-y-3">
              {recentMeetings.length > 0 ? (
                recentMeetings.map((meeting, index) => (
                  <MeetingCard key={index} meeting={meeting} />
                ))
              ) : (
                <div className="text-center py-8">
                  <Video className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No meetings yet</p>
                  <Link to="/create" className="text-blue-500 hover:underline text-sm mt-2 inline-block">
                    Create your first meeting →
                  </Link>
                </div>
              )}
            </div>
          </motion.div>

          {/* Active & Upcoming Meetings */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Active Meetings */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-2xl font-semibold flex items-center gap-2 mb-6">
                <Activity className="w-5 h-5 text-green-500" />
                Active Meetings
              </h2>
              {activeMeetings.length > 0 ? (
                <div className="space-y-3">
                  {activeMeetings.map((meeting, index) => (
                    <ActiveMeetingCard 
                      key={index} 
                      meeting={meeting} 
                      onJoin={() => joinMeeting(meeting.meetingId)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Video className="w-6 h-6 text-gray-500" />
                  </div>
                  <p className="text-gray-400">No active meetings</p>
                </div>
              )}
            </div>

            {/* Upcoming Meetings */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-2xl font-semibold flex items-center gap-2 mb-6">
                <Calendar className="w-5 h-5 text-yellow-500" />
                Upcoming Meetings
              </h2>
              {upcomingMeetings.length > 0 ? (
                <div className="space-y-3">
                  {upcomingMeetings.slice(0, 3).map((meeting, index) => (
                    <UpcomingMeetingCard 
                      key={index} 
                      meeting={meeting}
                      onJoin={() => joinMeeting(meeting.meetingId)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No upcoming meetings</p>
                  <Link to="/scheduler" className="text-blue-500 hover:underline text-sm mt-2 inline-block">
                    Schedule a meeting →
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <QuickActionButton
            icon={<Video className="w-5 h-5" />}
            text="New Meeting"
            color="blue"
            onClick={() => window.location.href = '/create'}
          />
          <QuickActionButton
            icon={<Users className="w-5 h-5" />}
            text="Join Meeting"
            color="green"
            onClick={() => window.location.href = '/join'}
          />
          <QuickActionButton
            icon={<Calendar className="w-5 h-5" />}
            text="Schedule"
            color="purple"
            onClick={() => window.location.href = '/scheduler'}
          />
          <QuickActionButton
            icon={<Star className="w-5 h-5" />}
            text="Contacts"
            color="orange"
            onClick={() => window.location.href = '/contacts'}
          />
        </motion.div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, subtitle, trend, color }) => {
  const colors = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
    orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30'
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-xl p-6 border backdrop-blur-sm`}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-gray-800/50 rounded-lg">{icon}</div>
        {trend && (
          <span className="text-xs text-green-500 bg-green-500/20 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm text-gray-400 mt-1">{title}</div>
      {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
    </div>
  );
};

const MeetingCard = ({ meeting }) => {
  const date = meeting.createdAt || meeting.date;
  const meetingDate = date ? new Date(date) : new Date();
  
  return (
    <div className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-semibold">{meeting.meetingName || 'Untitled Meeting'}</h3>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {meetingDate.toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {meeting.duration || 0} min
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {meeting.participantsCount || 0} participants
            </div>
          </div>
        </div>
        <Link
          to={`/meeting/${meeting.meetingId}`}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition"
        >
          Rejoin
        </Link>
      </div>
    </div>
  );
};

const ActiveMeetingCard = ({ meeting, onJoin }) => {
  return (
    <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            {meeting.meetingName || 'Active Meeting'}
          </h3>
          <div className="text-sm text-gray-400 mt-1">
            ID: {meeting.meetingId}
          </div>
          <div className="text-sm text-gray-400">
            {meeting.activeParticipants || 0} participants online
          </div>
        </div>
        <button
          onClick={onJoin}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition"
        >
          Join Now
        </button>
      </div>
    </div>
  );
};

const UpcomingMeetingCard = ({ meeting, onJoin }) => {
  const meetingDate = new Date(meeting.datetime || meeting.date);
  const isToday = meetingDate.toDateString() === new Date().toDateString();
  const isSoon = (meetingDate - new Date()) < 3600000; // Within 1 hour
  
  return (
    <div className="bg-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-semibold">{meeting.meetingName}</h3>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {isToday ? 'Today' : meetingDate.toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {meeting.time || meetingDate.toLocaleTimeString()}
            </div>
            {isSoon && !isToday && (
              <span className="text-yellow-500 text-xs">Starting soon!</span>
            )}
          </div>
        </div>
        <button
          onClick={onJoin}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition"
          disabled={!isToday}
        >
          {isToday ? 'Join' : 'View'}
        </button>
      </div>
    </div>
  );
};

const QuickActionButton = ({ icon, text, color, onClick }) => {
  const colors = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
    orange: 'bg-orange-600 hover:bg-orange-700'
  };

  return (
    <button
      onClick={onClick}
      className={`${colors[color]} rounded-xl p-4 flex flex-col items-center gap-2 transition transform hover:scale-105`}
    >
      {icon}
      <span className="text-sm font-medium">{text}</span>
    </button>
  );
};

export default Dashboard;