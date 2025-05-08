// import React, { useEffect, useRef, useState } from 'react';
// import { IconButton } from '@mui/material';
// import MicIcon from '@mui/icons-material/Mic';

// const AudioToTextChatbox = () => {
//   const [isRecording, setIsRecording] = useState(false);
//   const [transcript, setTranscript] = useState('');
//   const wsRef = useRef(null);
//   const pcRef = useRef(null);
//   const localStreamRef = useRef(null);

//   // Establish WebSocket connection
//   useEffect(() => {
//     const ws = new WebSocket('ws://127.0.0.1:7860/ws');
//     wsRef.current = ws;

//     ws.onmessage = async (event) => {
//       const message = JSON.parse(event.data);

//       // Handle transcription text
//       if (message.transcript) {
//         setTranscript((prev) => prev + '\n' + message.transcript);
//       }

//       // Handle WebRTC signaling (SDP/ICE)
//       const pc = pcRef.current;
//       if (!pc) return;

//       if (message.sdp) {
//         const remoteDesc = new RTCSessionDescription(message.sdp);
//         await pc.setRemoteDescription(remoteDesc);
//         if (remoteDesc.type === 'offer') {
//           const answer = await pc.createAnswer();
//           await pc.setLocalDescription(answer);
//           ws.send(JSON.stringify({ sdp: pc.localDescription }));
//         }
//       }

//       if (message.candidate) {
//         try {
//           await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
//         } catch (e) {
//           console.error("Error adding received ice candidate", e);
//         }
//       }
//     };

//     return () => {
//       ws.close();
//     };
//   }, []);

//   const toggleRecording = async () => {
//     if (!isRecording) {
//       // Start recording
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       localStreamRef.current = stream;

//       const pc = new RTCPeerConnection({
//         iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
//       });
//       pcRef.current = pc;

//       // Send audio stream
//       stream.getTracks().forEach(track => pc.addTrack(track, stream));

//       // Handle ICE candidates
//       pc.onicecandidate = (event) => {
//         if (event.candidate && wsRef.current.readyState === WebSocket.OPEN) {
//           wsRef.current.send(JSON.stringify({ candidate: event.candidate }));
//         }
//       };

//       // Create offer and send SDP to backend
//       const offer = await pc.createOffer();
//       await pc.setLocalDescription(offer);
//       wsRef.current.send(JSON.stringify({ sdp: pc.localDescription }));

//       setIsRecording(true);
//     } else {
//       // Stop recording
//       localStreamRef.current?.getTracks().forEach(track => track.stop());
//       pcRef.current?.close();
//       pcRef.current = null;
//       setIsRecording(false);
//     }
//   };

//   return (
//     <div>
//       <IconButton
//         color={isRecording ? 'error' : 'primary'}
//         onClick={toggleRecording}
//       >
//         <MicIcon />
//       </IconButton>
//       <p>Transcript:</p>
//       <textarea rows={10} cols={50} value={transcript} readOnly />
//     </div>
//   );
// };

// export default AudioToTextChatbox;


//107 woring

// import React, { useEffect, useState, useRef } from 'react';
// import { IconButton } from '@mui/material';
// import MicIcon from '@mui/icons-material/Mic';

// const AudioToTextChatbox = () => {
//   const [isRecording, setIsRecording] = useState(false);
//   const [transcript, setTranscript] = useState('');
//   const wsRef = useRef(null);
//   const localStreamRef = useRef(null);
//   const recorderRef = useRef(null);

//   useEffect(() => {
//     const ws = new WebSocket('ws://127.0.0.1:7860/ws');
//     wsRef.current = ws;

//     ws.onopen = () => {
//       console.log('WebSocket connection opened');
//     };

//     ws.onmessage = (event) => {
//       try {
//         const message = JSON.parse(event.data);
//         if (message.transcript) {
//           setTranscript((prev) => prev + '\n' + message.transcript);
//         }
//       } catch (err) {
//         console.error('Invalid message received:', event.data);
//       }
//     };

//     ws.onerror = (err) => {
//       console.error('WebSocket error:', err);
//     };

//     ws.onclose = () => {
//       console.log('WebSocket closed');
//     };

//     return () => {
//       ws.close();
//     };
//   }, []);

//   const toggleRecording = async () => {
//     if (!isRecording) {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//         localStreamRef.current = stream;

//         const recorder = new MediaRecorder(stream);
//         recorderRef.current = recorder;

//         recorder.ondataavailable = (event) => {
//           const audioBlob = event.data;
//           const reader = new FileReader();
//           reader.onloadend = () => {
//             const audioBase64 = reader.result.split(',')[1]; // base64 payload
//             const message = JSON.stringify({ audio: audioBase64 });

//             if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
//               wsRef.current.send(message);
//             } else {
//               console.error('WebSocket is not open.');
//             }
//           };
//           reader.readAsDataURL(audioBlob);
//         };

//         recorder.start(1000); // Send data every 1 second
//         setIsRecording(true);
//       } catch (err) {
//         console.error('Error accessing microphone:', err);
//       }
//     } else {
//       if (recorderRef.current && recorderRef.current.state !== 'inactive') {
//         recorderRef.current.stop();
//       }

//       localStreamRef.current?.getTracks().forEach(track => track.stop());
//       setIsRecording(false);
//     }
//   };

//   return (
//     <div style={{ padding: '20px' }}>
//       <IconButton
//         color={isRecording ? 'error' : 'primary'}
//         onClick={toggleRecording}
//         size="large"
//       >
//         <MicIcon />
//       </IconButton>
//       <p><strong>Transcript:</strong></p>
//       <textarea rows={10} cols={60} value={transcript} readOnly />
//     </div>
//   );
// };

// export default AudioToTextChatbox;


// import { Button } from "@mui/material";
// import React from "react";
// import SpeechRecognition, {
//   useSpeechRecognition,
// } from "react-speech-recognition";

// const AudioToTextChatbox = () => {

//   const {
//     transscript,
//     listening,
//     resetTranscript,
//     browserSupportsSpeechRecognition
//   } = useSpeechRecognition()

//   if(!browserSupportsSpeechRecognition){
//     return <span>Your Browser doesn't support Speech to Text</span>
//   }

//  console.log(transscript);
 
//   return (
//     <>
//       <p>Microphone: {listening ? 'on' : 'off'}</p>
//       <Button onClick={SpeechRecognition.startListening}>Start</Button>
//       <Button onClick={SpeechRecognition.stopListening}>Stop</Button>
//       <Button onClick={resetTranscript}>Reset</Button>
//       <p>{transscript}</p>
//     </>
//   );
// };

// export default AudioToTextChatbox;

//******************************************** */
// import React, { useRef, useState } from "react";
// import { Button } from "@mui/material";
// import SpeechRecognition, {
//   useSpeechRecognition,
// } from "react-speech-recognition";

// const AudioToTextChatbox = () => {
//   const [mediaRecorder, setMediaRecorder] = useState(null);
//   const [audioURL, setAudioURL] = useState(null);
//   const audioChunksRef = useRef([]);

//   const {
//     transcript,
//     listening,
//     resetTranscript,
//     browserSupportsSpeechRecognition,
//   } = useSpeechRecognition();

//   if (!browserSupportsSpeechRecognition) {
//     return <span>Your browser doesn't support Speech Recognition.</span>;
//   }

//   const startRecording = async () => {
//     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//     const recorder = new MediaRecorder(stream);
//     setMediaRecorder(recorder);
//     audioChunksRef.current = [];

//     recorder.ondataavailable = (event) => {
//       if (event.data.size > 0) {
//         audioChunksRef.current.push(event.data);
//       }
//     };

//     recorder.onstop = () => {
//       const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
//       const audioUrl = URL.createObjectURL(audioBlob);
//       setAudioURL(audioUrl);
//     };

//     recorder.start();
//     SpeechRecognition.startListening({ continuous: true, language: "en-US" });
//   };

//   const stopRecording = () => {
//     SpeechRecognition.stopListening();
//     if (mediaRecorder) {
//       mediaRecorder.stop();
//     }
//   };

//   return (
//     <div>
//       <p>Microphone: {listening ? "on" : "off"}</p>

//       <Button variant="contained" onClick={startRecording}>
//         Start Recording
//       </Button>

//       <Button variant="outlined" onClick={stopRecording}>
//         Stop Recording
//       </Button>

//       <Button variant="text" onClick={resetTranscript}>
//         Reset Text
//       </Button>

//       <p>Transcript:</p>
//       <p>{transcript}</p>

//       {audioURL && (
//         <div>
//           <audio src={audioURL} controls />
//           <a href={audioURL} download="recording.wav">
//             <Button variant="contained" color="secondary">
//               Download WAV
//             </Button>
//           </a>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AudioToTextChatbox;



//*********************running*********************** */

// import React, { useRef, useState } from "react";
// import { Button, IconButton } from "@mui/material";
// import MicIcon from "@mui/icons-material/Mic";
// import SpeechRecognition, {
//   useSpeechRecognition,
// } from "react-speech-recognition";

// const AudioToTextChatbox = () => {
//   const [mediaRecorder, setMediaRecorder] = useState(null);
//   const [audioURL, setAudioURL] = useState(null);
//   const [isRecording, setIsRecording] = useState(false);
//   const audioChunksRef = useRef([]);

//   const {
//     transcript,
//     listening,
//     resetTranscript,
//     browserSupportsSpeechRecognition,
//   } = useSpeechRecognition();

//   if (!browserSupportsSpeechRecognition) {
//     return <span>Your browser doesn't support Speech Recognition.</span>;
//   }

//   const toggleRecording = async () => {
//     if (!isRecording) {
//       // Start recording
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       const recorder = new MediaRecorder(stream);
//       setMediaRecorder(recorder);
//       audioChunksRef.current = [];

//       recorder.ondataavailable = (event) => {
//         if (event.data.size > 0) {
//           audioChunksRef.current.push(event.data);
//         }
//       };

//       recorder.onstop = () => {
//         const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
//         const audioUrl = URL.createObjectURL(audioBlob);
//         setAudioURL(audioUrl);
//       };

//       recorder.start();
//       SpeechRecognition.startListening({ continuous: true, language: "en-US" });
//       setIsRecording(true);
//     } else {
//       // Stop recording
//       SpeechRecognition.stopListening();
//       if (mediaRecorder) {
//         mediaRecorder.stop();
//       }
//       setIsRecording(false);
//     }
//   };

//   return (
//     <div>
//       <p>Microphone: {listening ? "on" : "off"}</p>

//       <IconButton
//         color={isRecording ? "error" : "primary"}
//         onClick={toggleRecording}
//         // aria-label={isRecording ? "Stop Recording" : "Start Recording"}
//       >
//         <MicIcon />
//       </IconButton>

//       <Button variant="text" onClick={resetTranscript}>
//         Reset Text
//       </Button>

//       <p>Transcript:</p>
//       <p>{transcript}</p>

//       {audioURL && (
//         <div>
//           <audio src={audioURL} controls />
//           <a href={audioURL} download="recording.wav">
//             <Button variant="contained" color="secondary">
//               Download WAV
//             </Button>
//           </a>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AudioToTextChatbox;




//====================================================================





// import { Button } from "@mui/material";
// import React from "react";
// import SpeechRecognition, {
//   useSpeechRecognition,
// } from "react-speech-recognition";

// const AudioToTextChatbox = () => {
//   const {
//     transcript,
//     listening,
//     resetTranscript,
//     browserSupportsSpeechRecognition,
//   } = useSpeechRecognition();

//   if (!browserSupportsSpeechRecognition) {
//     return <span>Your browser doesn't support Speech Recognition.</span>;
//   }

//   return (
//     <>
//       <p>Microphone: {listening ? "on" : "off"}</p>
//       <Button
//         variant="contained"
//         onClick={() =>
//           SpeechRecognition.startListening({ continuous: true, language: "en-US" })
//         }
//       >
//         Start
//       </Button>
//       <Button variant="outlined" onClick={SpeechRecognition.stopListening}>
//         Stop
//       </Button>
//       <Button variant="text" onClick={resetTranscript}>
//         Reset
//       </Button>
//       <p>{transcript}</p>
//     </>
//   );
// };

// export default AudioToTextChatbox;



//=========================================================================================================================










// import React, { useEffect } from "react";
// import useSpeechToText from "react-hook-speech-to-text";

// const AudioToTextChatbox = () => {
//   const {
//     error,
//     interimResult,
//     isRecording,
//     results,
//     startSpeechToText,
//     stopSpeechToText,
//   } = useSpeechToText({
//     useLegacyResults: false,  // prevent deprecation warning
//     continuous: true,
//   });

//   useEffect(() => {
//     console.log("Component rendered/updated. isRecording:", isRecording);
//     // console.log("jhbfjhbf",isRecording);
//   }, [isRecording]);

//   const handleButtonClick = () => {
//     console.log("Button clicked. isRecording:", isRecording);
//     if (isRecording) {
//       stopSpeechToText?.();
//     } else {
//       startSpeechToText?.();
//     }
//   };

//   if (error) {
//     console.error("Speech recognition error:", error);
//     return (
//       <p>
//         Web Speech API is not supported by this browser. Please try Chrome or
//         Edge.
//       </p>
//     );
//   }

//   return (
//     <>
//       <h1>Speech to Text Example</h1>
//       <button onClick={handleButtonClick}>
//         {isRecording ? "Stop Listening" : "Start Listening"}
//       </button>

//       {isRecording && <p>Listening...</p>}

//       <div>
//         <h2>Recognized Text:</h2>
//         <textarea
//           rows="10"
//           cols="50"
//           readOnly
//           value={
//             isRecording
//               ? interimResult
//               : results.map((r) => r.transcript).join(" ")
//           }
//         />
//       </div>
//     </>
//   );
// };

// export default AudioToTextChatbox;

// import React, { useEffect, useRef, useState } from "react";

// const AudioToTextSearch = () => {
//   const [listening, setListening] = useState(false);
//   const [searchText, setSearchText] = useState("");
//   const recognitionRef = useRef(null);

//   useEffect(() => {
//     const SpeechRecognition =
//       window.SpeechRecognition || window.webkitSpeechRecognition;

//     if (!SpeechRecognition) {
//       alert("Web Speech API not supported.");
//       return;
//     }

//     const recognition = new SpeechRecognition();
//     recognition.continuous = true;
//     recognition.interimResults = true;
//     recognition.lang = "en-US";

//     recognition.onresult = (event) => {
//       let finalTranscript = "";

//       for (let i = event.resultIndex; i < event.results.length; ++i) {
//         if (event.results[i].isFinal) {
//           finalTranscript += event.results[i][0].transcript + " ";
//         }
//       }

//       if (finalTranscript) {
//         setSearchText((prev) => prev + finalTranscript);
//       }
//     };

//     recognition.onerror = (event) => {
//       console.error("Speech recognition error", event.error);
//       if (event.error === "not-allowed") {
//         alert("Mic access denied. Please allow microphone permission in browser settings.");
//       }
//     };

//     recognitionRef.current = recognition;
//   }, []);

//   const toggleListening = () => {
//     if (!recognitionRef.current) return;

//     if (listening) {
//       recognitionRef.current.stop();
//       setListening(false);
//     } else {
//       recognitionRef.current.start();
//       setListening(true);
//     }
//   };

//   return (
//     <div>
//       <h1>Speech-to-Search</h1>
//       <input
//         type="text"
//         value={searchText}
//         onChange={(e) => setSearchText(e.target.value)}
//         placeholder="Speak or type to search"
//         style={{backgroundColor:"white",height:50,width:'25%'}}
//       />
//       {/* <p>{searchText}</p> */}
//       <br /><br/>
//       <button onClick={toggleListening}>
//         {listening ? "Stop Listening" : "Start Listening"}
//       </button>
//       {listening && <p style={{ color: "green" }}>🎤 Listening...</p>}
//     </div>
//   );
// };

// export default AudioToTextSearch;





// import React, { useState, useRef } from 'react';
// import { IconButton } from '@mui/material';
// import MicIcon from '@mui/icons-material/Mic';

// const AudioToTextChatbox = () => {
//   const [isRecording, setIsRecording] = useState(false);
//   const mediaRecorderRef = useRef(null);
//   const socketRef = useRef(null);

//   const toggleRecording = async () => {
//     if (!isRecording) {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

//       // Initialize WebSocket
//       socketRef.current = new WebSocket('ws://localhost:5000/ws');
//       socketRef.current.binaryType = 'arraybuffer';

//       socketRef.current.onopen = () => {
//         console.log('WebSocket connection established');
//         mediaRecorderRef.current = new MediaRecorder(stream, {
//           mimeType: 'audio/webm',
//         });

//         mediaRecorderRef.current.ondataavailable = (event) => {
//           if (event.data.size > 0 && socketRef.current.readyState === WebSocket.OPEN) {
//             socketRef.current.send(event.data);
//           }
//         };

//         mediaRecorderRef.current.start(250); // send every 250ms
//         setIsRecording(true);
//       };
//     } else {
//       mediaRecorderRef.current.stop();
//       socketRef.current.close();
//       setIsRecording(false);
//     }
//   };

//   return (
//     <div>
//       <IconButton color={isRecording ? 'error' : 'primary'} onClick={toggleRecording}>
//         <MicIcon />
//       </IconButton>
//     </div>
//   );
// };

// export default AudioToTextChatbox;





// import React, { useState, useRef } from 'react';
// import { IconButton } from '@mui/material';
// import MicIcon from '@mui/icons-material/Mic';

// const AudioToTextChatbox = () => {
//   const [isRecording, setIsRecording] = useState(false);
//   const [transcription, setTranscription] = useState('');
//   const mediaRecorderRef = useRef(null);
//   const socketRef = useRef(null);

//   const toggleRecording = async () => {
//     if (!isRecording) {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

//       // Initialize WebSocket
//       socketRef.current = new WebSocket('ws://localhost:5000/ws');
//       socketRef.current.binaryType = 'arraybuffer';

//       socketRef.current.onopen = () => {
//         console.log('WebSocket connection established');
//         mediaRecorderRef.current = new MediaRecorder(stream, {
//           mimeType: 'audio/webm',
//         });

//         mediaRecorderRef.current.ondataavailable = (event) => {
//           if (event.data.size > 0 && socketRef.current.readyState === WebSocket.OPEN) {
//             socketRef.current.send(event.data);
//           }
//         };

//         mediaRecorderRef.current.start(250); // send every 250ms
//         setIsRecording(true);
//       };

//       // Handle the transcription message from the backend
//       socketRef.current.onmessage = (event) => {
//         const message = event.data;
//         setTranscription(message); // Display the transcription in the UI
//       };
//     } else {
//       mediaRecorderRef.current.stop();
//       socketRef.current.close();
//       setIsRecording(false);
//     }
//   };

//   return (
//     <div>
//       <IconButton color={isRecording ? 'error' : 'primary'} onClick={toggleRecording}>
//         <MicIcon />
//       </IconButton>
//       <p>Transcript:</p>
//       <textarea rows={10} cols={50} value={transcription} readOnly />
//     </div>
//   );
// };

// export default AudioToTextChatbox;









// Last working code

// import React, { useState, useRef } from 'react';
// import { IconButton } from '@mui/material';
// import MicIcon from '@mui/icons-material/Mic';

// const AudioToTextChatbox = () => {
//   const [isRecording, setIsRecording] = useState(false);
//   const [transcript, setTranscript] = useState('');
//   const mediaRecorderRef = useRef(null);
//   const audioChunksRef = useRef([]);
//   const socketRef = useRef(null);
//   const timeoutRef = useRef(null);

//   const toggleRecording = async () => {
//     if (!isRecording) {
//       // Start recording
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

//       // Setup WebSocket
//       socketRef.current = new WebSocket('ws://localhost:5000/ws');
//       socketRef.current.binaryType = 'arraybuffer';

//       socketRef.current.onopen = () => {
//         console.log('WebSocket connection opened');
//         mediaRecorderRef.current = new MediaRecorder(stream);
//         audioChunksRef.current = [];

//         mediaRecorderRef.current.ondataavailable = (event) => {
//           if (event.data.size > 0 && socketRef.current.readyState === WebSocket.OPEN) {
//             socketRef.current.send(event.data);
//             audioChunksRef.current.push(event.data);
//           }
//         };

//         mediaRecorderRef.current.onstop = () => {
//           console.log('Recording stopped, awaiting transcription...');
//           // Fallback timeout in case server does not respond
//           timeoutRef.current = setTimeout(() => {
//             if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
//               // socketRef.current.close();
//               console.warn('WebSocket closed due to timeout waiting for transcription.');
//             }
//           }, 10000); // 10 seconds timeout
//         };

//         mediaRecorderRef.current.start(500); // Send audio chunks every 500ms
//         setIsRecording(true);
//       };

//       socketRef.current.onmessage = (event) => {
//         console.log("hello");
        
//         console.log('Received from server:', event.data);
//         setTranscript(event.data);

//         if (timeoutRef.current) clearTimeout(timeoutRef.current); // Clear fallback

//         if (socketRef.current.readyState === WebSocket.OPEN) {
//           socketRef.current.close();
//           console.log('WebSocket closed after receiving transcription');
//         }
//       };

//       socketRef.current.onclose = () => {
//         console.log('WebSocket connection closed');
//       };

//       socketRef.current.onerror = (error) => {
//         console.error('WebSocket error:', error);
//       };
//     } else {
//       // Stop recording
//       if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
//         mediaRecorderRef.current.stop();
//       }
//       setIsRecording(false);
//     }
//   };

//   return (
//     <div>
//       <IconButton
//         color={isRecording ? 'error' : 'primary'}
//         onClick={toggleRecording}
//       >
//         <MicIcon />
//       </IconButton>
//       <p>Transcript:</p>
//       <textarea rows={10} cols={50} value={transcript} readOnly />
//     </div>
//   );
// };

// export default AudioToTextChatbox;

// Last working code


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




