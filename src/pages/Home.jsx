import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Users, Calendar, Phone, Monitor, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Welcome back,{' '}
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              {user.displayName || user.username || 'Guest'}!
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Premium Video Conferencing for Everyone
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center mb-12">
            <button
              onClick={() => navigate('/create')}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition transform hover:scale-105 flex items-center gap-2"
            >
              <Video className="w-5 h-5" />
              New Meeting
            </button>
            <button
              onClick={() => navigate('/join')}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition transform hover:scale-105 flex items-center gap-2"
            >
              <Phone className="w-5 h-5" />
              Join Meeting
            </button>
            <button
              onClick={() => navigate('/scheduler')}
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition transform hover:scale-105 flex items-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              Schedule
            </button>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mt-20">
          <FeatureCard
            icon={<Video className="w-8 h-8 text-blue-500" />}
            title="HD Video"
            description="High-quality video calls with up to 100 participants"
          />
          <FeatureCard
            icon={<Monitor className="w-8 h-8 text-green-500" />}
            title="Screen Sharing"
            description="Share your screen with crystal clear quality"
          />
          <FeatureCard
            icon={<MessageSquare className="w-8 h-8 text-purple-500" />}
            title="Live Chat"
            description="Real-time messaging during meetings"
          />
          <FeatureCard
            icon={<Calendar className="w-8 h-8 text-orange-500" />}
            title="Record Meetings"
            description="Record and save your important meetings"
          />
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 text-center border border-gray-700"
  >
    <div className="flex justify-center mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-400 text-sm">{description}</p>
  </motion.div>
);

export default Home;