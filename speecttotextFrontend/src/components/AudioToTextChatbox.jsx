import React, { useRef, useState } from 'react';
import RecordRTC from 'recordrtc';

const AudioRecorder = () => {
  const [transcript, setTranscript] = useState('');
  const recorderRef = useRef(null);
  const streamRef = useRef(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    recorderRef.current = RecordRTC(stream, {
      type: 'audio',
      mimeType: 'audio/wav', // Record directly in WAV
      recorderType: RecordRTC.StereoAudioRecorder,
      desiredSampRate: 16000,
      numberOfAudioChannels: 1,
    });

    recorderRef.current.startRecording();
  };

  const stopRecording = () => {
    recorderRef.current.stopRecording(async () => {
      const audioBlob = recorderRef.current.getBlob();

      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.wav');

      const response = await fetch('http://localhost:5000/upload-audio', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setTranscript(data.transcript || 'No speech recognized');
      streamRef.current.getTracks().forEach(track => track.stop());
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <button onClick={startRecording}>Start</button>
      <button onClick={stopRecording}>Stop</button>
      <h3>Transcript:</h3>
      <textarea rows={10} cols={60} value={transcript} readOnly />
    </div>
  );
};

export default AudioRecorder;