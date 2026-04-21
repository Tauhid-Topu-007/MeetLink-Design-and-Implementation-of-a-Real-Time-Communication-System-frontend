import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import SimplePeer from 'simple-peer';

const useWebRTC = (roomId, userName) => {
  const [localStream, setLocalStream] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const peersRef = useRef({});
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io('http://localhost:5000', {
      transports: ['websocket', 'polling']
    });
    
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        setLocalStream(stream);
        
        socketRef.current.emit('join-room', { roomId, userName });
        
        socketRef.current.on('user-joined', (user) => {
          createPeer(user.userId, user.userName, true);
        });
        
        socketRef.current.on('receive-signal', (data) => {
          const { signal, userId, userName } = data;
          if (peersRef.current[userId]) {
            peersRef.current[userId].signal(signal);
          } else {
            createPeer(userId, userName, false, signal);
          }
        });

        socketRef.current.on('user-left', ({ userId }) => {
          if (peersRef.current[userId]) {
            peersRef.current[userId].destroy();
            delete peersRef.current[userId];
            setParticipants(prev => prev.filter(p => p.userId !== userId));
          }
        });
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    };
    
    initMedia();
    
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      Object.values(peersRef.current).forEach(peer => peer.destroy());
      socketRef.current.disconnect();
    };
  }, [roomId, userName]);

  const createPeer = (userId, userName, initiator, signal) => {
    const peer = new SimplePeer({
      initiator,
      trickle: false,
      stream: localStream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ]
      }
    });
    
    peer.on('signal', (signal) => {
      socketRef.current.emit('send-signal', {
        signal,
        userId,
        roomId
      });
    });
    
    peer.on('stream', (stream) => {
      setParticipants(prev => [...prev, { 
        userId, 
        name: userName, 
        stream, 
        isMicOn: true, 
        isVideoOn: true 
      }]);
    });

    peer.on('error', (err) => {
      console.error('Peer error:', err);
    });
    
    if (signal) {
      peer.signal(signal);
    }
    
    peersRef.current[userId] = peer;
  };

  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
        socketRef.current.emit('toggle-mic', { roomId, isOn: audioTrack.enabled });
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
        socketRef.current.emit('toggle-video', { roomId, isOn: videoTrack.enabled });
      }
    }
  };

  const shareScreen = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true,
        audio: false
      });
      
      const videoTrack = screenStream.getVideoTracks()[0];
      
      // Replace video track for all peers
      Object.values(peersRef.current).forEach(peer => {
        const sender = peer._pc.getSenders().find(s => s.track && s.track.kind === 'video');
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      });
      
      videoTrack.onended = () => {
        // Restore camera when screen sharing ends
        if (localStream) {
          const cameraTrack = localStream.getVideoTracks()[0];
          Object.values(peersRef.current).forEach(peer => {
            const sender = peer._pc.getSenders().find(s => s.track && s.track.kind === 'video');
            if (sender) {
              sender.replaceTrack(cameraTrack);
            }
          });
        }
      };
    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  };

  return {
    localStream,
    participants,
    isMicOn,
    isVideoOn,
    toggleMic,
    toggleVideo,
    shareScreen
  };
};

export default useWebRTC;