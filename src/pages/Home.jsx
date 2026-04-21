import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Users, Calendar, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Zoom Clone
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Premium Video Conferencing for Everyone
          </p>
          
          <div className="flex gap-4 justify-center mb-12">
            <button
              onClick={() => navigate('/create')}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition transform hover:scale-105"
            >
              New Meeting
            </button>
            <button
              onClick={() => navigate('/join')}
              className="px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition transform hover:scale-105"
            >
              Join Meeting
            </button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-20">
          <FeatureCard
            icon={<Video className="w-8 h-8 text-blue-500" />}
            title="HD Video"
            description="High-quality video calls with up to 100 participants"
          />
          <FeatureCard
            icon={<Users className="w-8 h-8 text-green-500" />}
            title="Screen Sharing"
            description="Share your screen with crystal clear quality"
          />
          <FeatureCard
            icon={<Calendar className="w-8 h-8 text-purple-500" />}
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
    className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 text-center"
  >
    <div className="flex justify-center mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </motion.div>
);

export default Home;