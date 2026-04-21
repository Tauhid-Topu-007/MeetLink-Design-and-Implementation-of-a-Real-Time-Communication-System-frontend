import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Video, Trash2, Download, Calendar, Clock, HardDrive, FolderOpen } from 'lucide-react';
import toast from 'react-hot-toast';

const Recordings = () => {
  const [recordings, setRecordings] = useState([]);

  useEffect(() => {
    loadRecordings();
  }, []);

  const loadRecordings = () => {
    const saved = localStorage.getItem('meetingRecordings');
    if (saved) {
      setRecordings(JSON.parse(saved));
    }
  };

  const deleteRecording = (id) => {
    const updated = recordings.filter(r => r.id !== id);
    localStorage.setItem('meetingRecordings', JSON.stringify(updated));
    setRecordings(updated);
    toast.success('Recording deleted');
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Recordings</h1>
            <p className="text-gray-400 mt-1">View and manage your meeting recordings</p>
          </div>
          <div className="bg-blue-600/20 px-4 py-2 rounded-lg">
            <span className="text-blue-400 font-semibold">{recordings.length}</span>
            <span className="text-gray-400 ml-2">Total Recordings</span>
          </div>
        </div>

        {recordings.length === 0 ? (
          <div className="text-center py-20 bg-gray-800/50 rounded-xl">
            <FolderOpen className="w-20 h-20 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Recordings Yet</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Start recording your meetings by clicking the record button in the meeting room. 
              Recordings will appear here after you save them.
            </p>
            <button
              onClick={() => window.location.href = '/create'}
              className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
            >
              Start a Meeting
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recordings.map((recording, index) => (
              <motion.div
                key={recording.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-800 rounded-xl overflow-hidden hover:bg-gray-700 transition border border-gray-700"
              >
                <div className="aspect-video bg-gray-900 relative group">
                  <video
                    src={recording.url}
                    className="w-full h-full object-cover"
                    controls
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition pointer-events-none" />
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 truncate">
                    {recording.meetingName || `Meeting ${recording.meetingId}`}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{formatDate(recording.timestamp)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4 flex-shrink-0" />
                      <span>{formatFileSize(recording.size)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 flex-shrink-0" />
                      <span className="text-xs font-mono">ID: {recording.meetingId}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = recording.url;
                        link.download = recording.fileName;
                        link.click();
                      }}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center gap-2 text-sm transition"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button
                      onClick={() => deleteRecording(recording.id)}
                      className="py-2 px-4 bg-red-600 hover:bg-red-700 rounded-lg flex items-center justify-center gap-2 text-sm transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Recordings;