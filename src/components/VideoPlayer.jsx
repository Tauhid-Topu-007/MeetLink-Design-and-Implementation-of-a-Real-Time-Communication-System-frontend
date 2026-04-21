import React, { useRef, useEffect } from 'react';
import { MicOff, VideoOff } from 'lucide-react';

const VideoPlayer = ({ stream, isLocal, name, isMicOn, isVideoOn }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="video-container group">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className="w-full h-full object-cover"
      />
      
      {!isVideoOn && (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
          <VideoOff className="w-12 h-12 text-gray-600" />
        </div>
      )}
      
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{name}</span>
          <div className="flex gap-2">
            {!isMicOn && <MicOff className="w-4 h-4 text-red-500" />}
            {!isVideoOn && <VideoOff className="w-4 h-4 text-red-500" />}
          </div>
        </div>
      </div>
      
      <div className="absolute inset-0 border-4 border-transparent group-hover:border-blue-500 rounded-lg transition-all duration-200 pointer-events-none" />
    </div>
  );
};

export default VideoPlayer;