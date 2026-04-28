import React, { useState, useEffect } from 'react';
import { Circle, Square, Save, Trash2, Download, Loader, Video } from 'lucide-react';
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
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="relative z-10">
      <div className="flex gap-2">
        {!isRecording && !recordedVideo ? (
          <button
            onClick={onStartRecording}
            className="px-3 py-2 rounded-full bg-red-600 hover:bg-red-700 transition flex items-center gap-2"
            title="Start Recording"
          >
            <Circle className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">Record</span>
          </button>
        ) : isRecording ? (
          <button
            onClick={onStopRecording}
            disabled={isConverting}
            className="px-3 py-2 rounded-full bg-gray-600 hover:bg-gray-700 transition flex items-center gap-2 disabled:opacity-50"
            title="Stop Recording"
          >
            <Square className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">
              {formatTime(recordingTime)}
            </span>
          </button>
        ) : null}

        {recordedVideo && (
          <>
            <button
              onClick={() => setShowPreview(true)}
              className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 transition"
              title="Preview Recording"
            >
              <Video className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSaveRecording(meetingId, meetingName)}
              className="px-3 py-2 rounded-full bg-green-600 hover:bg-green-700 transition flex items-center gap-2"
              title="Save Recording"
            >
              <Save className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Save</span>
            </button>
            <button
              onClick={onClearRecording}
              className="p-2 rounded-full bg-red-600 hover:bg-red-700 transition"
              title="Clear Recording"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && recordedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-gray-800 rounded-2xl max-w-4xl w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <h3 className="text-xl font-semibold">Recording Preview</h3>
                <button onClick={() => setShowPreview(false)} className="p-1 hover:bg-gray-700 rounded">
                  ✕
                </button>
              </div>
              <div className="p-4">
                <video src={recordedVideo.url} controls autoPlay className="w-full rounded-lg" />
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = recordedVideo.url;
                      link.download = `meeting_${meetingId}_${Date.now()}.mp4`;
                      link.click();
                    }}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download MP4
                  </button>
                  <button
                    onClick={() => {
                      onSaveRecording(meetingId, meetingName);
                      setShowPreview(false);
                    }}
                    className="flex-1 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save
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