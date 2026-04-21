import React from 'react';
import { MicOff, VideoOff, Crown, Users } from 'lucide-react';

const ParticipantsList = ({ participants }) => {
  const activeParticipants = participants.filter(p => p.isActive !== false);
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold">Participants</h3>
          <span className="text-sm text-blue-400 font-medium">{activeParticipants.length}</span>
        </div>
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <Users className="w-3 h-3" />
          Unlimited participants allowed
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {activeParticipants.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No other participants yet</p>
            <p className="text-xs mt-1">Share the meeting ID to invite others</p>
          </div>
        ) : (
          activeParticipants.map((participant, index) => (
            <div key={participant.id || index} className="flex items-center justify-between p-2 bg-gray-700 rounded-lg">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {participant.isCreator && <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
                <span className="font-medium truncate">{participant.name}</span>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {!participant.isMicOn && <MicOff className="w-4 h-4 text-red-500" />}
                {!participant.isVideoOn && <VideoOff className="w-4 h-4 text-red-500" />}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="p-4 border-t border-gray-700 text-center">
        <p className="text-xs text-gray-500">
          Total joined: {participants.length}
        </p>
      </div>
    </div>
  );
};

export default ParticipantsList;