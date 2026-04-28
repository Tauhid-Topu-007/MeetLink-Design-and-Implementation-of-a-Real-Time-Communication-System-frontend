import { useEffect, useRef, useState, useCallback } from 'react';
import io from 'socket.io-client';
import SimplePeer from 'simple-peer';
import toast from 'react-hot-toast';

const useWebRTC = (roomId, userName) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const peers = useRef({});
  const socket = useRef(null);
  const localStreamRef = useRef(null);

  useEffect(() => {
    if (!roomId || !userName) return;

    // Connect to socket
    socket.current = io('http://localhost:5000');

    // Get user media
    const startMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        setLocalStream(stream);
        localStreamRef.current = stream;
        console.log('✅ Local stream obtained');
        
        // Join room
        socket.current.emit('join-room', { roomId, userName });
        
        // Handle existing participants
        socket.current.on('existing-participants', ({ participants }) => {
          console.log('📋 Existing participants:', participants);
          participants.forEach(participant => {
            console.log(`📞 Initiating call to existing participant: ${participant.name}`);
            initiateCall(participant.userId, participant.name);
          });
        });
        
        // Handle new user joined
        socket.current.on('user-joined', ({ userId, userName: remoteName }) => {
          console.log(`👤 New user joined: ${remoteName}`);
          if (userId !== socket.current.id) {
            console.log(`📞 Initiating call to new user: ${remoteName}`);
            initiateCall(userId, remoteName);
          }
        });
        
        // Handle WebRTC signals
        socket.current.on('webrtc-signal', ({ userId, signal }) => {
          console.log(`📡 Received signal from: ${userId}`);
          if (peers.current[userId]) {
            peers.current[userId].signal(signal);
          } else if (signal.type === 'offer') {
            console.log(`📞 Creating peer for incoming call from: ${userId}`);
            createPeer(userId, 'Remote', false, signal);
          }
        });
        
        // Handle user disconnected
        socket.current.on('user-disconnected', ({ userId }) => {
          console.log(`👋 User disconnected: ${userId}`);
          if (peers.current[userId]) {
            peers.current[userId].destroy();
            delete peers.current[userId];
            setRemoteStreams(prev => prev.filter(p => p.userId !== userId));
          }
        });
        
      } catch (err) {
        console.error('❌ Media error:', err);
        toast.error('Cannot access camera/microphone');
      }
    };
    
    startMedia();
    
    // Cleanup
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      Object.values(peers.current).forEach(peer => peer.destroy());
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [roomId, userName]);
  
  const initiateCall = useCallback((userId, remoteName) => {
    if (peers.current[userId]) {
      console.log(`⚠️ Peer already exists for ${remoteName}`);
      return;
    }
    if (!localStreamRef.current) {
      console.log('❌ No local stream available');
      return;
    }
    
    createPeer(userId, remoteName, true);
  }, []);
  
  const createPeer = useCallback((userId, remoteName, initiator, incomingSignal = null) => {
    console.log(`🔧 Creating peer for ${remoteName}, initiator: ${initiator}`);
    
    const peer = new SimplePeer({
      initiator: initiator,
      trickle: false,
      stream: localStreamRef.current,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' }
        ]
      }
    });
    
    peer.on('signal', (data) => {
      console.log(`📡 Sending signal to ${remoteName}: ${data.type}`);
      socket.current.emit('webrtc-signal', {
        userId: userId,
        signal: data
      });
    });
    
    peer.on('stream', (stream) => {
      console.log(`🎥 Received stream from ${remoteName}`);
      setRemoteStreams(prev => {
        const exists = prev.find(p => p.userId === userId);
        if (exists) return prev;
        console.log(`✅ Added ${remoteName} to remote streams`);
        return [...prev, {
          userId: userId,
          name: remoteName,
          stream: stream
        }];
      });
    });
    
    peer.on('error', (err) => {
      console.error(`❌ Peer error with ${remoteName}:`, err);
    });
    
    peer.on('connect', () => {
      console.log(`🔗 Peer connected with ${remoteName}`);
    });
    
    peer.on('close', () => {
      console.log(`🔒 Peer closed with ${remoteName}`);
      setRemoteStreams(prev => prev.filter(p => p.userId !== userId));
    });
    
    if (incomingSignal) {
      console.log(`📞 Signaling with incoming offer for ${remoteName}`);
      peer.signal(incomingSignal);
    }
    
    peers.current[userId] = peer;
  }, []);
  
  const toggleMic = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
        socket.current?.emit('toggle-mic', { 
          roomId, 
          isOn: audioTrack.enabled, 
          userName 
        });
        toast.success(audioTrack.enabled ? 'Microphone on' : 'Microphone off');
      }
    }
  }, [roomId, userName]);
  
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
        socket.current?.emit('toggle-video', { 
          roomId, 
          isOn: videoTrack.enabled, 
          userName 
        });
        toast.success(videoTrack.enabled ? 'Camera on' : 'Camera off');
      }
    }
  }, [roomId, userName]);
  
  const shareScreen = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const videoTrack = screenStream.getVideoTracks()[0];
      
      Object.values(peers.current).forEach(peer => {
        const sender = peer._pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) sender.replaceTrack(videoTrack);
      });
      
      videoTrack.onended = () => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
          const newTrack = stream.getVideoTracks()[0];
          Object.values(peers.current).forEach(peer => {
            const sender = peer._pc.getSenders().find(s => s.track?.kind === 'video');
            if (sender) sender.replaceTrack(newTrack);
          });
          setLocalStream(stream);
          localStreamRef.current = stream;
        });
      };
      
      toast.success('Screen sharing started');
    } catch (err) {
      console.error('Screen share error:', err);
      toast.error('Failed to share screen');
    }
  }, []);
  
  const stopScreenShare = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const videoTrack = stream.getVideoTracks()[0];
      
      Object.values(peers.current).forEach(peer => {
        const sender = peer._pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) sender.replaceTrack(videoTrack);
      });
      
      setLocalStream(stream);
      localStreamRef.current = stream;
      toast.success('Screen sharing stopped');
    } catch (err) {
      console.error('Stop screen share error:', err);
    }
  }, []);
  
  return {
    localStream,
    remoteStreams,
    isMicOn,
    isVideoOn,
    toggleMic,
    toggleVideo,
    shareScreen,
    stopScreenShare
  };
};

export default useWebRTC;