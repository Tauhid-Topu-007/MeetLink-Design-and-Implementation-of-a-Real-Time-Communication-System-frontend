import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, File, Image, Music, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Chat = ({ messages, onSendMessage, onSendFile, roomId, currentUser }) => {
  const [message, setMessage] = useState('');
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = () => {
    if (message.trim()) {
      // Prevent duplicate sends by checking if already sending
      if (onSendMessage) {
        onSendMessage(message);
        setMessage('');
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size should be less than 50MB');
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const fileData = {
          name: file.name,
          type: file.type,
          size: file.size,
          data: event.target.result,
          roomId
        };
        
        if (onSendFile) {
          await onSendFile(fileData);
        }
        toast.success(`File ${file.name} sent successfully`);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error sending file:', error);
      toast.error('Failed to send file');
    } finally {
      setUploading(false);
      setShowFileMenu(false);
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (fileType.startsWith('audio/')) return <Music className="w-4 h-4" />;
    if (fileType.startsWith('video/')) return <Video className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, index) => (
          <motion.div
            key={msg.id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`chat-message ${msg.sender === currentUser ? 'chat-message-own' : 'chat-message-other'} max-w-[80%]`}
          >
            <div className="text-xs text-gray-400 mb-1">{msg.sender}</div>
            
            {msg.type === 'file' ? (
              <div className="bg-gray-800 rounded p-2">
                <div className="flex items-center gap-2">
                  {getFileIcon(msg.fileType)}
                  <span className="text-sm break-words">{msg.fileName}</span>
                </div>
                {msg.fileType.startsWith('image/') && (
                  <img 
                    src={msg.fileData} 
                    alt={msg.fileName} 
                    className="mt-2 max-w-full rounded cursor-pointer"
                    onClick={() => window.open(msg.fileData, '_blank')}
                  />
                )}
                {msg.fileType.startsWith('audio/') && (
                  <audio controls className="mt-2 w-full">
                    <source src={msg.fileData} type={msg.fileType} />
                  </audio>
                )}
                {msg.fileType.startsWith('video/') && (
                  <video controls className="mt-2 max-w-full rounded">
                    <source src={msg.fileData} type={msg.fileType} />
                  </video>
                )}
                <a 
                  href={msg.fileData} 
                  download={msg.fileName}
                  className="text-xs text-blue-500 mt-1 block"
                >
                  Download
                </a>
              </div>
            ) : (
              <div className="break-words">{msg.text}</div>
            )}
            
            <div className="text-xs text-gray-500 mt-1">{msg.time}</div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <div className="relative">
            <button
              onClick={() => setShowFileMenu(!showFileMenu)}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
              title="Attach file"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            
            <AnimatePresence>
              {showFileMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute bottom-full left-0 mb-2 bg-gray-800 rounded-lg shadow-xl p-2"
                >
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-4 py-2 text-left hover:bg-gray-700 rounded transition"
                  >
                    Choose File
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,audio/*,video/*,application/pdf,.doc,.docx,.txt"
            />
          </div>
          
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 bg-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="2"
            disabled={uploading}
          />
          
          <button
            onClick={handleSend}
            disabled={!message.trim() || uploading}
            className="px-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        {uploading && (
          <div className="text-xs text-gray-400 mt-2 text-center">
            Uploading file...
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;