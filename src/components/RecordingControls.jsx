import React from 'react';
import { Mic, MicOff, Video, VideoOff, Circle, Square, Save, Trash2, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RecordingControls = ({ 
  isRecording, 
  recordedVideo, 
  onStartRecording, 
  onStopRecording, 
  onSaveRecording,
  onClearRecording,
  meetingId,
  meetingName 
}) => {
  const [showPreview, setShowPreview] = React.useState(false);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="relative">
      {/* Recording Indicator */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-red-600 rounded-full px-4 py-2 flex items-center gap-2 shadow-lg"
          >
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold">RECORDING</span>
            <span className="text-xs">{new Date().toLocaleTimeString()}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording Controls */}
      <div className="flex gap-2">
        {!isRecording && !recordedVideo ? (
          <button
            onClick={onStartRecording}
            className="p-2 rounded-full bg-red-600 hover:bg-red-700 transition flex items-center gap-2"
            title="Start Recording"
          >
            <Circle className="w-5 h-5" />
            <span className="text-sm hidden sm:inline">Record</span>
          </button>
        ) : isRecording ? (
          <button
            onClick={onStopRecording}
            className="p-2 rounded-full bg-gray-600 hover:bg-gray-700 transition flex items-center gap-2"
            title="Stop Recording"
          >
            <Square className="w-5 h-5" />
            <span className="text-sm hidden sm:inline">Stop</span>
          </button>
        ) : null}

        {recordedVideo && (
          <>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 transition"
              title="Preview Recording"
            >
              <Video className="w-5 h-5" />
            </button>
            <button
              onClick={() => onSaveRecording(meetingId, meetingName)}
              className="p-2 rounded-full bg-green-600 hover:bg-green-700 transition flex items-center gap-2"
              title="Save Recording"
            >
              <Save className="w-5 h-5" />
              <span className="text-sm hidden sm:inline">Save</span>
            </button>
            <button
              onClick={onClearRecording}
              className="p-2 rounded-full bg-red-600 hover:bg-red-700 transition"
              title="Clear Recording"
            >
              <Trash2 className="w-5 h-5" />
            </button>
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
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-gray-800 rounded-xl max-w-4xl w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <h3 className="text-xl font-semibold">Recording Preview</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-1 hover:bg-gray-700 rounded"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-4">
                <video
                  src={recordedVideo.url}
                  controls
                  autoPlay
                  className="w-full rounded-lg"
                  style={{ maxHeight: '60vh' }}
                />
                
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">File Size:</span>
                    <span className="ml-2">{formatFileSize(recordedVideo.size)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Recorded:</span>
                    <span className="ml-2">{new Date(recordedVideo.timestamp).toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = recordedVideo.url;
                      link.download = `recording_${meetingId}_${Date.now()}.webm`;
                      link.click();
                    }}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    onClick={() => onSaveRecording(meetingId, meetingName)}
                    className="flex-1 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save to Library
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