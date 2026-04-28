import React from 'react';
import { MicOff, VideoOff, Crown, User, Users as UsersIcon } from 'lucide-react';

const ParticipantsList = ({ participants }) => {
  // Ensure participants is an array and remove duplicates
  const uniqueParticipants = React.useMemo(() => {
    if (!participants || !Array.isArray(participants)) return [];
    
    const seen = new Map();
    participants.forEach(p => {
      if (p.userId && !seen.has(p.userId)) {
        seen.set(p.userId, p);
      }
    });
    return Array.from(seen.values());
  }, [participants]);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-700 bg-gray-800/50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-blue-400" />
            Participants
          </h3>
          <span className="text-sm bg-blue-600 px-2 py-0.5 rounded-full">
            {uniqueParticipants.length}
          </span>
        </div>
        <p className="text-xs text-gray-400">Unlimited participants allowed</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {uniqueParticipants.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No other participants</p>
            <p className="text-xs mt-1">Share meeting ID to invite others</p>
          </div>
        ) : (
          uniqueParticipants.map((participant, idx) => (
            <div 
              key={participant.userId || idx} 
              className="flex items-center justify-between p-3 bg-gray-700/50 rounded-xl hover:bg-gray-700 transition-all duration-200"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                  {participant.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">
                      {participant.name}
                    </span>
                    {participant.isCreator && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        Host
                      </span>
                    )}
                    {participant.isCurrentUser && (
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full">
                        You
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {!participant.isMicOn && (
                  <div className="p-1.5 bg-red-500/20 rounded-full" title="Microphone off">
                    <MicOff className="w-3.5 h-3.5 text-red-400" />
                  </div>
                )}
                {!participant.isVideoOn && (
                  <div className="p-1.5 bg-red-500/20 rounded-full" title="Camera off">
                    <VideoOff className="w-3.5 h-3.5 text-red-400" />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ParticipantsList;