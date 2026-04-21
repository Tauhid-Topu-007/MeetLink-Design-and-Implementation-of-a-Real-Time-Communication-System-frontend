import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import VideoPlayer from './VideoPlayer';
import Controls from './Controls';
import Chat from './Chat';
import Whiteboard from './Whiteboard';
import ParticipantsList from './ParticipantsList';
import AttendanceExport from './AttendanceExport';
import useWebRTC from '../hooks/useWebRTC';
import useSocket from '../hooks/useSocket';
import { X, FileSpreadsheet } from 'lucide-react';

const MeetingRoom = () => {
  const { meetingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const [isAutoPresenting, setIsAutoPresenting] = useState(false);
  const { isCreator, displayName, password, meetingName } = location.state || {};
  
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

  const { sendMessage, sendFile, messages, participants: socketParticipants } = useSocket(meetingId, displayName);

  // Auto-present for ALL users when they join (not just creator)
  useEffect(() => {
    const timer = setTimeout(() => {
      handleAutoPresent();
    }, 3000); // Auto-present after 3 seconds
    
    return () => clearTimeout(timer);
  }, []);

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

  const handleSendFile = async (fileData) => {
    await sendFile(fileData);
  };

  // Prepare attendance data
  const attendanceParticipants = participants.map(p => ({
    name: p.name,
    userId: p.userId,
    joinedAt: p.joinedAt || new Date(),
    leftAt: p.leftAt,
    duration: p.duration,
    isActive: p.isActive !== false,
    email: p.email
  }));

  // Add current user to attendance if not already there
  if (displayName && !attendanceParticipants.some(p => p.name === displayName)) {
    attendanceParticipants.push({
      name: displayName,
      userId: 'current_user',
      joinedAt: new Date(),
      isActive: true
    });
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Meeting Info Bar */}
      <div className="bg-gray-800 px-4 py-2 text-center border-b border-gray-700 flex justify-between items-center">
        <div className="w-20"></div>
        <span className="text-sm text-gray-300">
          Meeting ID: <span className="font-mono font-bold">{meetingId}</span>
          {meetingName && ` • ${meetingName}`}
        </span>
        <button
          onClick={() => setShowAttendance(!showAttendance)}
          className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2 text-sm transition"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Attendance
        </button>
      </div>

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
              <Chat 
                messages={messages} 
                onSendMessage={sendMessage}
                onSendFile={handleSendFile}
                roomId={meetingId}
                currentUser={displayName}
              />
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

          {showAttendance && (
            <motion.div
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col"
            >
              <div className="flex justify-between items-center p-4 border-b border-gray-700">
                <h3 className="font-semibold">Attendance Report</h3>
                <button onClick={() => setShowAttendance(false)} className="p-1 hover:bg-gray-700 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <AttendanceExport 
                  participants={attendanceParticipants}
                  meetingId={meetingId}
                  meetingName={meetingName}
                />
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