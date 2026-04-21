import { useEffect, useState, useRef, useCallback } from 'react';
import io from 'socket.io-client';

const useSocket = (roomId, userName) => {
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const socketRef = useRef(null);
  const messageIdRef = useRef(0);

  useEffect(() => {
    if (!roomId || !userName) return;

    socketRef.current = io('http://localhost:5000', {
      transports: ['websocket', 'polling']
    });
    
    socketRef.current.emit('join-room', { roomId, userName });
    
    // Listen for participants update
    socketRef.current.on('participants-update', (participantsList) => {
      console.log('Participants update received:', participantsList);
      setParticipants(participantsList || []);
    });
    
    // Listen for room joined event
    socketRef.current.on('room-joined', (data) => {
      console.log('Room joined:', data);
      if (data.participants) {
        setParticipants(data.participants);
      }
    });
    
    // Handle incoming chat messages
    socketRef.current.on('chat-message', (message) => {
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
    
    // Handle user joined
    socketRef.current.on('user-joined', (user) => {
      console.log('User joined:', user);
      toast?.success(`${user.userName} joined the meeting`);
    });
    
    // Handle user left
    socketRef.current.on('user-left', (user) => {
      console.log('User left:', user);
      toast?.success(`A participant left the meeting`);
    });
    
    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave-room', { roomId });
        socketRef.current.disconnect();
      }
    };
  }, [roomId, userName]);

  const sendMessage = useCallback((text) => {
    if (!text.trim() || !socketRef.current) return;
    
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
    if (!socketRef.current) return;
    
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