// client/src/hooks/useRecordingAdvanced.js
import { useState, useRef, useCallback } from 'react';
import RecordRTC from 'recordrtc';
import toast from 'react-hot-toast';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

const useRecordingAdvanced = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const ffmpegRef = useRef(null);

  // Initialize FFmpeg
  const initFFmpeg = async () => {
    if (!ffmpegRef.current) {
      const ffmpeg = new FFmpeg();
      await ffmpeg.load();
      ffmpegRef.current = ffmpeg;
    }
    return ffmpegRef.current;
  };

  const startRecording = useCallback(async (stream) => {
    try {
      if (recorderRef.current && isRecording) {
        stopRecording();
      }

      const combinedStream = new MediaStream();
      stream.getVideoTracks().forEach(track => combinedStream.addTrack(track));
      stream.getAudioTracks().forEach(track => combinedStream.addTrack(track));
      streamRef.current = combinedStream;

      // Record in webm format first (better performance)
      const recorder = new RecordRTC(combinedStream, {
        type: 'video',
        mimeType: 'video/webm',
        recorderType: RecordRTC.MediaStreamRecorder,
        bitsPerSecond: 1280000,
        timeSlice: 1000,
        ondataavailable: (blob) => {},
        video: {
          width: 1280,
          height: 720,
          frameRate: 30
        }
      });

      recorder.startRecording();
      recorderRef.current = recorder;
      setIsRecording(true);
      
      toast.success('Recording started!');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
    }
  }, [isRecording]);

  const convertToMP4 = async (webmBlob) => {
    try {
      setIsConverting(true);
      const ffmpeg = await initFFmpeg();
      
      // Write webm file to FFmpeg
      const inputFileName = 'input.webm';
      const outputFileName = 'output.mp4';
      
      await ffmpeg.writeFile(inputFileName, await fetchFile(webmBlob));
      
      // Convert to MP4
      await ffmpeg.exec([
        '-i', inputFileName,
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-movflags', '+faststart',
        '-preset', 'medium',
        '-crf', '23',
        outputFileName
      ]);
      
      // Read the converted file
      const data = await ffmpeg.readFile(outputFileName);
      const mp4Blob = new Blob([data.buffer], { type: 'video/mp4' });
      const url = URL.createObjectURL(mp4Blob);
      
      setIsConverting(false);
      return { blob: mp4Blob, url };
    } catch (error) {
      console.error('Error converting to MP4:', error);
      setIsConverting(false);
      // Fallback to webm if conversion fails
      const url = URL.createObjectURL(webmBlob);
      return { blob: webmBlob, url };
    }
  };

  const stopRecording = useCallback(async () => {
    return new Promise((resolve) => {
      if (recorderRef.current && isRecording) {
        recorderRef.current.stopRecording(async () => {
          const webmBlob = recorderRef.current.getBlob();
          
          // Convert to MP4
          const mp4Result = await convertToMP4(webmBlob);
          
          setRecordedVideo({
            url: mp4Result.url,
            blob: mp4Result.blob,
            timestamp: new Date().toISOString(),
            size: mp4Result.blob.size,
            type: 'video/mp4'
          });
          
          setIsRecording(false);
          toast.success('Recording stopped and converted to MP4!');
          resolve(mp4Result);
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

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `meeting_${meetingName || meetingId}_${timestamp}.mp4`;
    
    // Create download link for MP4 file
    const downloadLink = document.createElement('a');
    downloadLink.href = recordedVideo.url;
    downloadLink.download = fileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // Save to localStorage
    const savedRecordings = JSON.parse(localStorage.getItem('meetingRecordings') || '[]');
    const newRecording = {
      id: Date.now(),
      meetingId,
      meetingName: meetingName || 'Untitled Meeting',
      fileName,
      timestamp: recordedVideo.timestamp,
      size: recordedVideo.size,
      url: recordedVideo.url,
      format: 'mp4'
    };
    
    savedRecordings.unshift(newRecording);
    localStorage.setItem('meetingRecordings', JSON.stringify(savedRecordings));
    
    toast.success(`Recording saved: ${fileName}`);
    return newRecording;
  }, [recordedVideo]);

  const clearRecording = useCallback(() => {
    if (recordedVideo) {
      URL.revokeObjectURL(recordedVideo.url);
    }
    setRecordedVideo(null);
  }, [recordedVideo]);

  return {
    isRecording,
    isConverting,
    recordedVideo,
    startRecording,
    stopRecording,
    saveRecording,
    clearRecording
  };
};

export default useRecordingAdvanced;