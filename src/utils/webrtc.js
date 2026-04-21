export const getIceServers = () => {
  return {
    iceServers: [
      {
        urls: 'stun:stun.l.google.com:19302'
      },
      {
        urls: 'stun:stun1.l.google.com:19302'
      },
      {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      }
    ]
  };
};

export const generateMeetingId = () => {
  return Math.random().toString(36).substring(2, 11).toUpperCase();
};

export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};