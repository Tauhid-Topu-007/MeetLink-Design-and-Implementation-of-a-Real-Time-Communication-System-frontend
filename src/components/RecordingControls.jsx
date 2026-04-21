import React, { useState, useEffect } from 'react';
import { Circle, Square, Save, Trash2, Download, Loader, Video, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const RecordingControls = ({ 
  isRecording, 
  isConverting = false,
  recordedVideo, 
  onStartRecording, 
  onStopRecording, 
  onSaveRecording,
  onClearRecording,
  meetingId, 
  meetingName 
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Timer for recording duration
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSaveRecording = () => {
    onSaveRecording(meetingId, meetingName);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDownload = () => {
    if (recordedVideo) {
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      link.href = recordedVideo.url;
      link.download = `meeting_recording_${meetingName || meetingId}_${timestamp}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download started!');
    }
  };

  return (
    <div className="relative">
      {/* Recording Indicator with Timer */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-14 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-red-600 to-red-700 rounded-full px-4 py-2 flex items-center gap-3 shadow-lg z-10 border border-red-400"
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-bold tracking-wide">REC</span>
            </div>
            <div className="text-sm font-mono bg-black/30 px-2 py-0.5 rounded">
              {formatTime(recordingTime)}
            </div>
            <div className="w-1 h-4 bg-red-400/50"></div>
            <div className="text-xs text-red-200">
              Recording in progress...
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Converting Indicator */}
      <AnimatePresence>
        {isConverting && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-14 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-full px-4 py-2 flex items-center gap-2 shadow-lg z-10 border border-yellow-400"
          >
            <Loader className="w-4 h-4 animate-spin" />
            <span className="text-sm font-semibold">Converting to MP4...</span>
            <div className="w-1 h-4 bg-yellow-400/50"></div>
            <span className="text-xs text-yellow-200">Please wait</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Success Indicator */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-14 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-600 to-green-700 rounded-full px-4 py-2 flex items-center gap-2 shadow-lg z-10 border border-green-400"
          >
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-semibold">Recording Saved!</span>
            <span className="text-xs text-green-200">MP4 file saved to library</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Controls */}
      <div className="flex gap-2">
        {!isRecording && !recordedVideo ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStartRecording}
            className="px-3 py-2 rounded-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition flex items-center gap-2 shadow-lg"
            title="Start Recording (MP4)"
          >
            <Circle className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Record</span>
          </motion.button>
        ) : isRecording ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStopRecording}
            disabled={isConverting}
            className="px-3 py-2 rounded-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 transition flex items-center gap-2 disabled:opacity-50 shadow-lg"
            title="Stop Recording"
          >
            <Square className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Stop</span>
          </motion.button>
        ) : null}

        {recordedVideo && (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPreview(true)}
              className="p-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition shadow-lg"
              title="Preview Recording"
            >
              <Video className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownload}
              className="p-2 rounded-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 transition shadow-lg"
              title="Download MP4"
            >
              <Download className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSaveRecording}
              className="px-3 py-2 rounded-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transition flex items-center gap-2 shadow-lg"
              title="Save Recording to Library"
            >
              <Save className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">Save</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClearRecording}
              className="p-2 rounded-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition shadow-lg"
              title="Clear Recording"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          </>
        )}
      </div>

      {/* Recording Preview Modal */}
      <AnimatePresence>
        {showPreview && recordedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-2xl max-w-5xl w-full overflow-hidden shadow-2xl border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b border-gray-700 flex justify-between items-center bg-gradient-to-r from-gray-800 to-gray-800">
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Recording Preview
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">MP4 format • High quality</p>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 hover:bg-gray-700 rounded-xl transition"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-5">
                <video
                  src={recordedVideo.url}
                  controls
                  autoPlay
                  className="w-full rounded-xl shadow-lg"
                  style={{ maxHeight: '55vh' }}
                />
                
                <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <span className="text-gray-400 text-xs block mb-1">Format</span>
                    <span className="text-green-400 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> MP4
                    </span>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <span className="text-gray-400 text-xs block mb-1">Size</span>
                    <span className="text-white font-semibold">{formatFileSize(recordedVideo.size)}</span>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <span className="text-gray-400 text-xs block mb-1">Recorded</span>
                    <span className="text-white font-semibold text-xs">{new Date(recordedVideo.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <span className="text-gray-400 text-xs block mb-1">Meeting</span>
                    <span className="text-white font-semibold text-xs truncate">{meetingName || meetingId}</span>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-5">
                  <button
                    onClick={handleDownload}
                    className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl flex items-center justify-center gap-2 font-medium transition transform hover:scale-[1.02]"
                  >
                    <Download className="w-4 h-4" />
                    Download MP4
                  </button>
                  <button
                    onClick={() => {
                      handleSaveRecording();
                      setShowPreview(false);
                    }}
                    className="flex-1 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-xl flex items-center justify-center gap-2 font-medium transition transform hover:scale-[1.02]"
                  >
                    <Save className="w-4 h-4" />
                    Save to Library
                  </button>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="py-2.5 px-5 bg-gray-700 hover:bg-gray-600 rounded-xl transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecordingControls;