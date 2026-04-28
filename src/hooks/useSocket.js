import { useEffect, useState, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import toast from 'react-hot-toast';

const useSocket = (roomId, userName) => {
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!roomId || !userName) return;

    socketRef.current = io('http://localhost:5000');
    
    socketRef.current.emit('join-room', { roomId, userName });
    
    // Handle participants list update
    socketRef.current.on('participants-list', (participantsList) => {
      console.log('📋 Participants list update:', participantsList);
      setParticipants(participantsList);
    });
    
    // Handle chat messages
    socketRef.current.on('chat-message', (message) => {
      setMessages(prev => [...prev, message]);
    });
    
    // Handle file messages
    socketRef.current.on('file-message', (fileMessage) => {
      setMessages(prev => [...prev, fileMessage]);
    });
    
    // Handle user joined notification
    socketRef.current.on('user-joined', ({ userName: remoteName }) => {
      toast.success(`${remoteName} joined the meeting`);
    });
    
    // Handle user disconnected notification
    socketRef.current.on('user-disconnected', ({ userId }) => {
      toast.success(`A participant left the meeting`);
    });
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [roomId, userName]);

  const sendMessage = useCallback((text) => {
    if (!text.trim() || !socketRef.current) return;
    
    const message = {
      id: Date.now(),
      sender: userName,
      text: text.trim(),
      time: new Date().toLocaleTimeString(),
      roomId
    };
    
    socketRef.current.emit('send-message', message);
    setMessages(prev => [...prev, message]);
  }, [userName, roomId]);

  const sendFile = useCallback(async (fileData) => {
    if (!socketRef.current) return;
    
    const fileMessage = {
      id: Date.now(),
      sender: userName,
      type: 'file',
      fileName: fileData.name,
      fileType: fileData.type,
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