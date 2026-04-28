import React from 'react';
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, 
  Monitor, MonitorStop, MessageSquare, Users, PenTool
} from 'lucide-react';
import { motion } from 'framer-motion';

const Controls = ({
  isMicOn,
  isVideoOn,
  onToggleMic,
  onToggleVideo,
  onShareScreen,
  onEndCall,
  onToggleChat,
  onToggleParticipants,
  onToggleWhiteboard,
  isScreenSharing,
  isAutoPresenting
}) => {
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="bg-gray-800/95 backdrop-blur-lg border-t border-gray-700 py-4 px-6 z-10 relative shadow-lg"
    >
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <ControlButton
          icon={isMicOn ? Mic : MicOff}
          label="Mute"
          onClick={onToggleMic}
          active={isMicOn}
          color="blue"
        />
        
        <ControlButton
          icon={isVideoOn ? Video : VideoOff}
          label="Video"
          onClick={onToggleVideo}
          active={isVideoOn}
          color="blue"
        />
        
        <ControlButton
          icon={isScreenSharing ? MonitorStop : Monitor}
          label={isScreenSharing ? "Stop Sharing" : "Share Screen"}
          onClick={onShareScreen}
          active={!isScreenSharing}
          color="green"
        />
        
        <ControlButton
          icon={MessageSquare}
          label="Chat"
          onClick={onToggleChat}
          color="purple"
        />
        
        <ControlButton
          icon={Users}
          label="Participants"
          onClick={onToggleParticipants}
          color="purple"
        />
        
        <ControlButton
          icon={PenTool}
          label="Whiteboard"
          onClick={onToggleWhiteboard}
          color="orange"
        />
        
        <button
          onClick={onEndCall}
          className="p-3 rounded-full bg-red-600 hover:bg-red-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>
      
      {isAutoPresenting && (
        <div className="text-center mt-3 text-sm text-green-500 animate-pulse">
          🎥 Auto-presenting screen in 3 seconds...
        </div>
      )}
    </motion.div>
  );
};

const ControlButton = ({ icon: Icon, label, onClick, active, color }) => {
  const colors = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
    orange: 'bg-orange-600 hover:bg-orange-700'
  };

  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-full transition-all duration-200 transform hover:scale-105 shadow-md ${colors[color]} ${!active && color === 'blue' ? 'bg-gray-600 hover:bg-gray-700' : ''}`}
      title={label}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
};

export default Controls;