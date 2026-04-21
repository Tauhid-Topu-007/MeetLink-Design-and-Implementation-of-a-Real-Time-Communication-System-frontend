import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import VideoPlayer from './VideoPlayer';
import Controls from './Controls';
import Chat from './Chat';
import Whiteboard from './Whiteboard';
import ParticipantsList from './ParticipantsList';
import AttendanceExport from './AttendanceExport';
import RecordingControls from './RecordingControls';
import useRecording from '../hooks/useRecording';
import useWebRTC from '../hooks/useWebRTC';
import useSocket from '../hooks/useSocket';
import { X, FileSpreadsheet, Users, Copy, Check, Video as VideoIcon } from 'lucide-react';

const MeetingRoom = () => {
  const { meetingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const [isAutoPresenting, setIsAutoPresenting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const { isCreator, displayName, password, meetingName } = location.state || {};
  
  const {
    localStream,
    participants: remoteParticipants,
    isMicOn,
    isVideoOn,
    toggleMic,
    toggleVideo,
    shareScreen
  } = useWebRTC(meetingId, displayName || 'Guest');

  const { sendMessage, sendFile, messages, participants: socketParticipants } = useSocket(meetingId, displayName);
  
  const {
    isRecording,
    isConverting,
    recordedVideo,
    startRecording,
    stopRecording,
    saveRecording,
    clearRecording
  } = useRecording();

  // Auto-present for ALL users when they join
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localStream) {
        setIsConnecting(false);
        handleAutoPresent();
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [localStream]);

  const handleAutoPresent = async () => {
    setIsAutoPresenting(true);
    toast.success('Auto-presenting your screen...');
    await shareScreen();
    setTimeout(() => setIsAutoPresenting(false), 5000);
  };

  const handleEndCall = () => {
    if (isRecording) {
      stopRecording();
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    navigate('/');
    toast.success('Meeting ended');
  };

  const handleStartRecording = () => {
    if (localStream) {
      startRecording(localStream);
    } else {
      toast.error('No stream available to record');
    }
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  const handleSaveRecording = () => {
    saveRecording(meetingId, meetingName);
  };

  const copyMeetingId = () => {
    navigator.clipboard.writeText(meetingId);
    setCopied(true);
    toast.success('Meeting ID copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Get unique video participants (excluding current user)
  const uniqueVideoParticipants = useMemo(() => {
    // Filter out duplicates by userId
    const unique = new Map();
    remoteParticipants.forEach(p => {
      if (p.userId && !unique.has(p.userId)) {
        unique.set(p.userId, p);
      }
    });
    return Array.from(unique.values());
  }, [remoteParticipants]);

  // Get unique socket participants (excluding current user)
  const uniqueSocketParticipants = useMemo(() => {
    const unique = new Map();
    socketParticipants.forEach(p => {
      if (p.userId && !unique.has(p.userId) && p.userId !== 'current_user') {
        unique.set(p.userId, p);
      }
    });
    return Array.from(unique.values());
  }, [socketParticipants]);

  // Calculate total participants (unique)
  const totalParticipants = useMemo(() => {
    const allParticipants = new Map();
    
    // Add current user
    if (displayName) {
      allParticipants.set('current_user', { name: displayName, isActive: true });
    }
    
    // Add remote participants
    uniqueVideoParticipants.forEach(p => {
      if (p.userId) allParticipants.set(p.userId, p);
    });
    
    // Add socket participants
    uniqueSocketParticipants.forEach(p => {
      if (p.userId) allParticipants.set(p.userId, p);
    });
    
    return allParticipants.size;
  }, [displayName, uniqueVideoParticipants, uniqueSocketParticipants]);

  // Get participants for attendance (unique)
  const attendanceParticipants = useMemo(() => {
    const allParticipants = new Map();
    
    if (displayName) {
      allParticipants.set('current_user', {
        name: displayName,
        userId: 'current_user',
        joinedAt: new Date(),
        isActive: true,
        duration: 0
      });
    }
    
    uniqueSocketParticipants.forEach(p => {
      if (!allParticipants.has(p.userId)) {
        allParticipants.set(p.userId, {
          name: p.name,
          userId: p.userId,
          joinedAt: p.joinedAt || new Date(),
          isActive: p.isActive !== false,
          duration: 0,
          email: p.email
        });
      }
    });
    
    uniqueVideoParticipants.forEach(p => {
      if (!allParticipants.has(p.userId)) {
        allParticipants.set(p.userId, {
          name: p.name,
          userId: p.userId,
          joinedAt: new Date(),
          isActive: true,
          duration: 0
        });
      }
    });
    
    return Array.from(allParticipants.values());
  }, [displayName, uniqueSocketParticipants, uniqueVideoParticipants]);

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Meeting Info Bar */}
      <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <RecordingControls
            isRecording={isRecording}
            isConverting={isConverting}
            recordedVideo={recordedVideo}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            onSaveRecording={handleSaveRecording}
            onClearRecording={clearRecording}
            meetingId={meetingId}
            meetingName={meetingName}
          />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-700 rounded-lg px-3 py-1">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium">
              {totalParticipants} participant{totalParticipants !== 1 ? 's' : ''}
            </span>
            <span className="text-xs text-gray-400">(Unlimited)</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-300">
              Meeting ID: <span className="font-mono font-bold">{meetingId}</span>
            </span>
            <button
              onClick={copyMeetingId}
              className="p-1 hover:bg-gray-700 rounded transition"
              title="Copy Meeting ID"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          
          {meetingName && (
            <span className="text-sm text-gray-300">
              • {meetingName}
            </span>
          )}
        </div>
        
        <button
          onClick={() => setShowAttendance(!showAttendance)}
          className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2 text-sm transition"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Attendance
        </button>
      </div>

      {/* Auto-presenting Indicator */}
      {isAutoPresenting && (
        <div className="bg-blue-600 text-white text-center py-1 text-sm">
          <VideoIcon className="w-4 h-4 inline mr-2 animate-pulse" />
          Auto-presenting your screen...
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {isConnecting ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Connecting to meeting...</p>
                <p className="text-xs text-gray-500 mt-2">Meeting ID: {meetingId}</p>
              </div>
            </div>
          ) : (
            <div className="video-grid">
              {/* Local video - always show */}
              <VideoPlayer
                stream={localStream}
                isLocal={true}
                name={displayName || 'You'}
                isMicOn={isMicOn}
                isVideoOn={isVideoOn}
              />
              
              {/* Remote participants - unique only */}
              {uniqueVideoParticipants.map((participant, index) => (
                <VideoPlayer
                  key={participant.userId || `remote-${index}`}
                  stream={participant.stream}
                  name={participant.name}
                  isMicOn={participant.isMicOn}
                  isVideoOn={participant.isVideoOn}
                />
              ))}
            </div>
          )}
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
                onSendFile={sendFile}
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
              <ParticipantsList participants={uniqueSocketParticipants} />
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