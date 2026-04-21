import { useState, useRef, useCallback } from 'react';
import RecordRTC from 'recordrtc';
import toast from 'react-hot-toast';

const useRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);

  const startRecording = useCallback(async (stream) => {
    try {
      // Stop any existing recording
      if (recorderRef.current && isRecording) {
        stopRecording();
      }

      // Create a new stream with both audio and video
      const combinedStream = new MediaStream();
      
      // Add video tracks
      stream.getVideoTracks().forEach(track => {
        combinedStream.addTrack(track);
      });
      
      // Add audio tracks
      stream.getAudioTracks().forEach(track => {
        combinedStream.addTrack(track);
      });

      streamRef.current = combinedStream;

      // Initialize recorder
      const recorder = new RecordRTC(combinedStream, {
        type: 'video',
        mimeType: 'video/webm',
        recorderType: RecordRTC.MediaStreamRecorder,
        bitsPerSecond: 128000,
        timeSlice: 1000,
        ondataavailable: (blob) => {
          setRecordedChunks(prev => [...prev, blob]);
        }
      });

      recorder.startRecording();
      recorderRef.current = recorder;
      setIsRecording(true);
      setRecordedChunks([]);
      setRecordedVideo(null);
      
      toast.success('Recording started!');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
    }
  }, [isRecording]);

  const stopRecording = useCallback(() => {
    return new Promise((resolve) => {
      if (recorderRef.current && isRecording) {
        recorderRef.current.stopRecording(() => {
          const blob = recorderRef.current.getBlob();
          const url = URL.createObjectURL(blob);
          
          setRecordedVideo({
            url,
            blob,
            timestamp: new Date().toISOString(),
            size: blob.size,
            type: 'video/webm'
          });
          
          setIsRecording(false);
          toast.success('Recording stopped!');
          resolve({ url, blob });
        });
      } else {
        resolve(null);
      }
    });
  }, [isRecording]);

  const saveRecording = useCallback((meetingId, meetingName) => {
    if (!recordedVideo) {
      toast.error('No recording to save');
      return null;
    }

    const fileName = `recording_${meetingName || meetingId}_${new Date().toISOString().replace(/[:.]/g, '-')}.webm`;
    
    // Create download link
    const downloadLink = document.createElement('a');
    downloadLink.href = recordedVideo.url;
    downloadLink.download = fileName;
    downloadLink.click();
    
    // Save to localStorage
    const savedRecordings = JSON.parse(localStorage.getItem('meetingRecordings') || '[]');
    const newRecording = {
      id: Date.now(),
      meetingId,
      meetingName,
      fileName,
      timestamp: recordedVideo.timestamp,
      size: recordedVideo.size,
      url: recordedVideo.url
    };
    
    savedRecordings.push(newRecording);
    localStorage.setItem('meetingRecordings', JSON.stringify(savedRecordings));
    
    toast.success('Recording saved!');
    return newRecording;
  }, [recordedVideo]);

  const clearRecording = useCallback(() => {
    if (recordedVideo) {
      URL.revokeObjectURL(recordedVideo.url);
    }
    setRecordedVideo(null);
    setRecordedChunks([]);
  }, [recordedVideo]);

  return {
    isRecording,
    recordedVideo,
    startRecording,
    stopRecording,
    saveRecording,
    clearRecording
  };
};

export default useRecording;