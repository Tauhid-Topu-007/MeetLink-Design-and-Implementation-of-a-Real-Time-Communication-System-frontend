import React, { useState, useEffect, useRef } from 'react';
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
import { 
  X, FileSpreadsheet, Users, Copy, Check, 
  Video as VideoIcon, Mic, MicOff, Camera, 
  Monitor, PhoneOff, MessageSquare, PenTool,
  Settings, Volume2, VolumeX
} from 'lucide-react';

const MeetingRoom = () => {
  const { meetingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // UI States
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [participantsList, setParticipantsList] = useState([]);
  const [screenShareActive, setScreenShareActive] = useState(false);
  
  const { displayName, meetingName, isCreator } = location.state || {};
  
  // Custom Hooks
  const {
    localStream,
    remoteStreams,
    isMicOn,
    isVideoOn,
    toggleMic,
    toggleVideo,
    shareScreen,
    stopScreenShare
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

  // Refs
  const videoGridRef = useRef(null);
  const connectionTimerRef = useRef(null);

  // Update participants list
  useEffect(() => {
    const allParticipants = [
      { 
        userId: 'current', 
        name: displayName || 'You', 
        isMicOn: isMicOn, 
        isVideoOn: isVideoOn, 
        isCurrentUser: true,
        isCreator: isCreator
      },
      ...remoteStreams.map(s => ({ 
        userId: s.userId, 
        name: s.name, 
        isMicOn: true, 
        isVideoOn: true, 
        isCurrentUser: false,
        isCreator: false
      }))
    ];
    setParticipantsList(allParticipants);
  }, [displayName, remoteStreams, isMicOn, isVideoOn, isCreator]);

  // Update connection status
  useEffect(() => {
    if (localStream) {
      setIsConnecting(false);
      setConnectionStatus('connected');
    }
    
    if (remoteStreams.length > 0) {
      setConnectionStatus('connected');
    }
  }, [localStream, remoteStreams]);

  // Auto-present for creator
  useEffect(() => {
    if (isCreator && localStream && !screenShareActive) {
      const timer = setTimeout(() => {
        handleAutoPresent();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isCreator, localStream]);

  // Connection timeout
  useEffect(() => {
    connectionTimerRef.current = setTimeout(() => {
      if (isConnecting) {
        setConnectionStatus('timeout');
        toast.error('Connection timeout. Please check your network.');
      }
    }, 30000);
    
    return () => clearTimeout(connectionTimerRef.current);
  }, [isConnecting]);

  const handleAutoPresent = async () => {
    try {
      await shareScreen();
      setScreenShareActive(true);
      toast.success('Auto-presenting your screen');
    } catch (error) {
      console.error('Auto-present failed:', error);
    }
  };

  const handleEndCall = () => {
    if (isRecording) {
      stopRecording();
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (screenShareActive) {
      stopScreenShare();
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

  const handleShareScreen = async () => {
    if (screenShareActive) {
      await stopScreenShare();
      setScreenShareActive(false);
      toast.success('Screen sharing stopped');
    } else {
      await shareScreen();
      setScreenShareActive(true);
      toast.success('Screen sharing started');
    }
  };

  const hasOtherParticipants = remoteStreams.length > 0;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Meeting Info Bar */}
      <div className="bg-gray-800/90 backdrop-blur-lg px-4 py-3 border-b border-gray-700 flex justify-between items-center z-20 shadow-lg">
        <div className="flex items-center gap-4">
          {/* Meeting Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <VideoIcon className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg hidden sm:block">Zoom Clone</span>
          </div>
          
          {/* Recording Controls */}
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
          {/* Participant Count */}
          <div className="flex items-center gap-2 bg-gray-700/50 rounded-lg px-3 py-1.5">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium">
              {participantsList.length} participant{participantsList.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          {/* Meeting ID */}
          <div className="flex items-center gap-2 bg-gray-700/50 rounded-lg px-3 py-1.5">
            <span className="text-xs text-gray-400 hidden sm:inline">ID:</span>
            <span className="text-sm font-mono font-bold">{meetingId}</span>
            <button 
              onClick={copyMeetingId} 
              className="p-0.5 hover:bg-gray-600 rounded transition"
              title="Copy Meeting ID"
            >
              {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
          
          {/* Meeting Name */}
          {meetingName && (
            <div className="hidden md:block text-sm text-gray-300">
              • {meetingName}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-700 rounded-lg transition"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          
          {/* Attendance Button */}
          <button
            onClick={() => setShowAttendance(!showAttendance)}
            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2 text-sm transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">Attendance</span>
          </button>
        </div>
      </div>

      {/* Connection Status Bar */}
      {connectionStatus === 'connecting' && (
        <div className="bg-yellow-600/80 backdrop-blur-sm text-white text-center py-1.5 text-sm">
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
            <span>Connecting to meeting...</span>
          </div>
        </div>
      )}
      {connectionStatus === 'connected' && hasOtherParticipants && (
        <div className="bg-green-600/80 backdrop-blur-sm text-white text-center py-1.5 text-sm">
          ✅ Connected - {remoteStreams.length} other participant{remoteStreams.length !== 1 ? 's' : ''} in the meeting
        </div>
      )}
      {screenShareActive && (
        <div className="bg-blue-600/80 backdrop-blur-sm text-white text-center py-1.5 text-sm">
          <Monitor className="w-4 h-4 inline mr-2" />
          You are sharing your screen
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Video Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {isConnecting ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold mb-2">Joining Meeting...</h3>
                <p className="text-gray-400">Please wait while we connect you</p>
                <p className="text-xs text-gray-500 mt-4">Meeting ID: {meetingId}</p>
              </div>
            </div>
          ) : (
            <div className="video-grid" ref={videoGridRef}>
              {/* Self Video */}
              <VideoPlayer
                stream={localStream}
                isLocal={true}
                name={`${displayName || 'You'} (You)`}
                isMicOn={isMicOn}
                isVideoOn={isVideoOn}
              />
              
              {/* Remote Videos */}
              {remoteStreams.map((remote) => (
                <VideoPlayer
                  key={remote.userId}
                  stream={remote.stream}
                  name={remote.name}
                  isMicOn={true}
                  isVideoOn={true}
                />
              ))}
              
              {/* Waiting Placeholder */}
              {!hasOtherParticipants && localStream && (
                <div className="video-container bg-gray-800/50 backdrop-blur-sm flex items-center justify-center border-2 border-dashed border-gray-600">
                  <div className="text-center text-gray-400">
                    <Users className="w-16 h-16 mx-auto mb-3 opacity-30" />
                    <p className="text-lg font-medium">Waiting for others to join...</p>
                    <p className="text-sm mt-2">Share this Meeting ID to invite participants:</p>
                    <div className="mt-2 flex items-center justify-center gap-2">
                      <code className="px-3 py-1 bg-gray-700 rounded text-blue-400 font-mono text-lg">
                        {meetingId}
                      </code>
                      <button
                        onClick={copyMeetingId}
                        className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded transition"
                      >
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs mt-4 text-gray-500">
                      Other participants will appear here once they join
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebars */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 bottom-0 w-96 bg-gray-800 border-l border-gray-700 flex flex-col z-30 shadow-2xl"
            >
              <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-800/95 backdrop-blur-sm">
                <h3 className="font-semibold text-lg">Chat</h3>
                <button 
                  onClick={() => setShowChat(false)} 
                  className="p-2 hover:bg-gray-700 rounded-lg transition"
                >
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
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-gray-800 border-l border-gray-700 flex flex-col z-30 shadow-2xl"
            >
              <ParticipantsList participants={participantsList} />
            </motion.div>
          )}

          {showWhiteboard && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center"
            >
              <div className="w-full max-w-6xl h-[85vh] bg-white rounded-2xl overflow-hidden shadow-2xl">
                <div className="flex justify-between items-center p-4 bg-gray-800">
                  <h3 className="font-semibold text-lg">Collaborative Whiteboard</h3>
                  <button 
                    onClick={() => setShowWhiteboard(false)} 
                    className="p-2 hover:bg-gray-700 rounded-lg transition"
                  >
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
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 bottom-0 w-96 bg-gray-800 border-l border-gray-700 flex flex-col z-30 shadow-2xl"
            >
              <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-800/95 backdrop-blur-sm">
                <h3 className="font-semibold text-lg">Attendance Report</h3>
                <button 
                  onClick={() => setShowAttendance(false)} 
                  className="p-2 hover:bg-gray-700 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <AttendanceExport 
                  participants={participantsList}
                  meetingId={meetingId}
                  meetingName={meetingName}
                />
              </div>
            </motion.div>
          )}

          {showSettings && (
            <motion.div
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-gray-800 border-l border-gray-700 flex flex-col z-30 shadow-2xl"
            >
              <div className="flex justify-between items-center p-4 border-b border-gray-700">
                <h3 className="font-semibold text-lg">Settings</h3>
                <button 
                  onClick={() => setShowSettings(false)} 
                  className="p-2 hover:bg-gray-700 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Meeting ID</label>
                  <div className="bg-gray-700 rounded-lg p-2 font-mono text-sm">{meetingId}</div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Your Name</label>
                  <div className="bg-gray-700 rounded-lg p-2 text-sm">{displayName}</div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Meeting Name</label>
                  <div className="bg-gray-700 rounded-lg p-2 text-sm">{meetingName || 'Not set'}</div>
                </div>
                <div className="pt-4 border-t border-gray-700">
                  <button
                    onClick={() => {
                      localStorage.clear();
                      window.location.href = '/';
                    }}
                    className="w-full py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition"
                  >
                    Clear App Data
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls Bar */}
      <Controls
        isMicOn={isMicOn}
        isVideoOn={isVideoOn}
        onToggleMic={toggleMic}
        onToggleVideo={toggleVideo}
        onShareScreen={handleShareScreen}
        onEndCall={handleEndCall}
        onToggleChat={() => setShowChat(!showChat)}
        onToggleParticipants={() => setShowParticipants(!showParticipants)}
        onToggleWhiteboard={() => setShowWhiteboard(!showWhiteboard)}
        isScreenSharing={screenShareActive}
        isAutoPresenting={false}
      />
    </div>
  );
};

export default MeetingRoom;