import React from 'react';
import { MicOff, VideoOff, Crown } from 'lucide-react';

const ParticipantsList = ({ participants }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h3 className="font-semibold">Participants ({participants.length})</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {participants.map((participant, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-700 rounded-lg">
            <div className="flex items-center gap-2">
              {participant.isCreator && <Crown className="w-4 h-4 text-yellow-500" />}
              <span className="font-medium">{participant.name}</span>
            </div>
            <div className="flex gap-2">
              {!participant.isMicOn && <MicOff className="w-4 h-4 text-red-500" />}
              {!participant.isVideoOn && <VideoOff className="w-4 h-4 text-red-500" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParticipantsList;