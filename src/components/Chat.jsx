import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { motion } from 'framer-motion';

const Chat = ({ messages, onSendMessage }) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  const currentUser = localStorage.getItem('displayName') || 'You';

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`chat-message ${msg.sender === currentUser ? 'chat-message-own' : 'chat-message-other'} max-w-[80%]`}
          >
            <div className="text-xs text-gray-400 mb-1">{msg.sender}</div>
            <div className="break-words">{msg.text}</div>
            <div className="text-xs text-gray-500 mt-1">{msg.time}</div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 bg-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="2"
          />
          <button
            onClick={handleSend}
            className="px-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;