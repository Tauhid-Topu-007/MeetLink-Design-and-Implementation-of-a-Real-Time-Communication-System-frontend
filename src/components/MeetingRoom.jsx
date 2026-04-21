import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import VideoPlayer from './VideoPlayer';
import Controls from './Controls';
import Chat from './Chat';
import Whiteboard from './Whiteboard';
import ParticipantsList from './ParticipantsList';
import useWebRTC from '../hooks/useWebRTC';
import useSocket from '../hooks/useSocket';
import { X } from 'lucide-react';

const MeetingRoom = () => {
  const { meetingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [isAutoPresenting, setIsAutoPresenting] = useState(false);
  const { isCreator, displayName, password } = location.state || {};
  
  const {
    localStream,
    participants,
    isMicOn,
    isVideoOn,
    toggleMic,
    toggleVideo,
    shareScreen,
    stopScreenShare
  } = useWebRTC(meetingId, displayName || 'Guest');

  const { sendMessage, messages, participants: socketParticipants } = useSocket(meetingId, displayName);

  useEffect(() => {
    if (isCreator && !isAutoPresenting) {
      const timer = setTimeout(() => {
        handleAutoPresent();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCreator]);

  const handleAutoPresent = async () => {
    setIsAutoPresenting(true);
    toast.success('Auto-presenting your screen...');
    await shareScreen();
  };

  const handleEndCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    navigate('/');
    toast.success('Meeting ended');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="video-grid">
            <VideoPlayer
              stream={localStream}
              isLocal={true}
              name={displayName || 'You'}
              isMicOn={isMicOn}
              isVideoOn={isVideoOn}
            />
            {participants.map((participant, index) => (
              <VideoPlayer
                key={index}
                stream={participant.stream}
                name={participant.name}
                isMicOn={participant.isMicOn}
                isVideoOn={participant.isVideoOn}
              />
            ))}
          </div>
        </div>

        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col"
            >
              <div className="flex justify-between items-center p-4 border-b border-gray-700">
                <h3 className="font-semibold">Chat</h3>
                <button onClick={() => setShowChat(false)} className="p-1 hover:bg-gray-700 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <Chat messages={messages} onSendMessage={sendMessage} />
            </motion.div>
          )}

          {showParticipants && (
            <motion.div
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col"
            >
              <ParticipantsList participants={socketParticipants} />
            </motion.div>
          )}

          {showWhiteboard && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
            >
              <div className="w-full max-w-6xl h-[80vh] bg-white rounded-lg overflow-hidden">
                <div className="flex justify-between items-center p-4 bg-gray-800">
                  <h3 className="font-semibold">Whiteboard</h3>
                  <button onClick={() => setShowWhiteboard(false)} className="p-1 hover:bg-gray-700 rounded">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <Whiteboard />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Controls
        isMicOn={isMicOn}
        isVideoOn={isVideoOn}
        onToggleMic={toggleMic}
        onToggleVideo={toggleVideo}
        onShareScreen={shareScreen}
        onEndCall={handleEndCall}
        onToggleChat={() => setShowChat(!showChat)}
        onToggleParticipants={() => setShowParticipants(!showParticipants)}
        onToggleWhiteboard={() => setShowWhiteboard(!showWhiteboard)}
        isAutoPresenting={isAutoPresenting}
      />
    </div>
  );
};

export default MeetingRoom;