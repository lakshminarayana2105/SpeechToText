// AudioRecorder.js
import React, { useRef, useState } from 'react';

const AudioRecorder = () => {
  const [transcript, setTranscript] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm' // We'll convert this on the backend
    });

    mediaRecorder.ondataavailable = (e) => {
      audioChunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      console.log("Blob size:", audioBlob.size); // Should be > 0
      audioChunksRef.current = [];

      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');

      const response = await fetch('http://localhost:5000/upload-audio', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setTranscript(data.transcript || 'No speech recognized');
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
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




