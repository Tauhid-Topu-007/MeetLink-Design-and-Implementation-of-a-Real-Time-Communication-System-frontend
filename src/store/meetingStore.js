import { create } from 'zustand';

const useMeetingStore = create((set) => ({
  currentMeeting: null,
  isMicOn: true,
  isVideoOn: true,
  isScreenSharing: false,
  participants: [],
  messages: [],
  
  setCurrentMeeting: (meeting) => set({ currentMeeting: meeting }),
  toggleMic: () => set((state) => ({ isMicOn: !state.isMicOn })),
  toggleVideo: () => set((state) => ({ isVideoOn: !state.isVideoOn })),
  setScreenSharing: (status) => set({ isScreenSharing: status }),
  setParticipants: (participants) => set({ participants }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
}));

export default useMeetingStore;