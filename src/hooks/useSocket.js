import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

const useSocket = (roomId, userName) => {
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io('http://localhost:5000');
    
    socketRef.current.emit('join-room', { roomId, userName });
    
    socketRef.current.on('chat-message', (message) => {
      setMessages(prev => [...prev, message]);
    });
    
    socketRef.current.on('participants-update', (participantsList) => {
      setParticipants(participantsList);
    });
    
    return () => {
      socketRef.current.disconnect();
    };
  }, [roomId, userName]);

  const sendMessage = (text) => {
    const message = {
      sender: userName,
      text,
      time: new Date().toLocaleTimeString(),
      roomId
    };
    socketRef.current.emit('send-message', message);
    setMessages(prev => [...prev, message]);
  };

  return {
    messages,
    participants,
    sendMessage
  };
};

export default useSocket;