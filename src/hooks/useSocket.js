import { useEffect, useState, useRef, useCallback } from 'react';
import io from 'socket.io-client';

const useSocket = (roomId, userName) => {
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const socketRef = useRef(null);
  const messageIdRef = useRef(0);

  useEffect(() => {
    socketRef.current = io('http://localhost:5000', {
      transports: ['websocket', 'polling']
    });
    
    socketRef.current.emit('join-room', { roomId, userName });
    
    // Handle incoming chat messages
    socketRef.current.on('chat-message', (message) => {
      // Prevent duplicate messages by checking ID
      setMessages(prev => {
        const exists = prev.some(m => m.id === message.id);
        if (exists) return prev;
        return [...prev, message];
      });
    });
    
    // Handle file messages
    socketRef.current.on('file-message', (fileMessage) => {
      setMessages(prev => {
        const exists = prev.some(m => m.id === fileMessage.id);
        if (exists) return prev;
        return [...prev, fileMessage];
      });
    });
    
    socketRef.current.on('participants-update', (participantsList) => {
      setParticipants(participantsList);
    });
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [roomId, userName]);

  const sendMessage = useCallback((text) => {
    if (!text.trim()) return;
    
    const message = {
      id: `${Date.now()}_${messageIdRef.current++}`,
      sender: userName,
      text: text.trim(),
      type: 'text',
      time: new Date().toLocaleTimeString(),
      roomId
    };
    
    socketRef.current.emit('send-message', message);
    setMessages(prev => [...prev, message]);
  }, [userName, roomId]);

  const sendFile = useCallback(async (fileData) => {
    const fileMessage = {
      id: `${Date.now()}_${messageIdRef.current++}`,
      sender: userName,
      type: 'file',
      fileName: fileData.name,
      fileType: fileData.type,
      fileSize: fileData.size,
      fileData: fileData.data,
      time: new Date().toLocaleTimeString(),
      roomId
    };
    
    socketRef.current.emit('send-file', fileMessage);
    setMessages(prev => [...prev, fileMessage]);
  }, [userName, roomId]);

  return {
    messages,
    participants,
    sendMessage,
    sendFile
  };
};

export default useSocket;