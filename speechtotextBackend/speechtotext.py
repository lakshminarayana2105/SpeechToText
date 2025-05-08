# from fastapi import FastAPI, WebSocket, WebSocketDisconnect
# from fastapi.middleware.cors import CORSMiddleware
# from fastrtc import get_stt_model, Stream, ReplyOnPause
# import numpy as np
# import json

# app = FastAPI()

# # CORS setup
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:3000"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Load STT model
# model = get_stt_model("moonshine/base")  # or other supported model


# @app.websocket("/ws")
# async def websocket_endpoint(websocket: WebSocket):
#     await websocket.accept()
#     print("WebSocket connection accepted")

#     async def on_transcribe(audio: tuple[int, np.ndarray]):
#         # Convert to text using the STT model
#         text = model.stt(audio)
#         await websocket.send_text(json.dumps({"transcript": text}))
#         print(f"Sent transcript: {text}")

#     # Create Stream instance
#     stream = Stream(
#         ReplyOnPause(on_transcribe),
#         modality="audio",
#         mode="send-receive"
#     )

#     try:
#         while True:
#             msg = await websocket.receive_text()
#             data = json.loads(msg)
#             await stream.signal(data)
#     except WebSocketDisconnect:
#         print("Client disconnected")
#     except Exception as e:
#         print("Error:", e)
#     finally:
#         await stream.close()


# @app.get("/")
# async def root():
#     return {"message": "Backend is running"}







# from fastrtc import Stream, ReplyOnPause, get_stt_model
# import numpy as np

# # Load STT model
# model = get_stt_model(model="moonshine/base")

# # Function to process audio and print transcript
# def transcribe_audio(audio: tuple[int, np.ndarray]):
#     text = model.stt(audio)
#     print(f"Transcribed Text: {text}")
#     yield audio  # stream continues

# # Create FastRTC stream for audio
# stream = Stream(
#     ReplyOnPause(transcribe_audio),
#     modality="audio",
#     mode="send-receive"
# )

# # Start FastRTC UI (this launches a local signaling + media server)
# stream.ui.launch()








# running






# from fastapi import FastAPI, WebSocket
# from fastapi.middleware.cors import CORSMiddleware
# import base64
# import logging
# from io import BytesIO
# import ffmpeg
# import speech_recognition as sr
# import tempfile
# import os

# app = FastAPI()

# # CORS for frontend access
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:3000"],  # Allow frontend access from localhost
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # WebSocket endpoint for handling incoming audio
# @app.websocket("/ws")
# async def websocket_endpoint(websocket: WebSocket):
#     await websocket.accept()
#     logging.info("WebSocket connection established")

#     recognizer = sr.Recognizer()

#     try:
#         while True:
#             data = await websocket.receive_text()
#             message = eval(data)  # Use safe parsing, e.g. json.loads in real production

#             if "audio" in message:
#                 audio_base64 = message["audio"]
#                 audio_data = base64.b64decode(audio_base64)
#                 audio_file = BytesIO(audio_data)

#                 try:
#                     # Create a temporary file to save the WebM audio file
#                     with tempfile.NamedTemporaryFile(delete=False) as temp_audio_file:
#                         temp_audio_file.write(audio_data)
#                         temp_audio_file_path = temp_audio_file.name

#                     # Convert the WebM file to WAV using FFmpeg
#                     wav_io = BytesIO()

#                     # Run FFmpeg on the temporary WebM file and convert it to WAV
#                     ffmpeg.input(temp_audio_file_path).output(wav_io, format='wav').run()

#                     # Ensure the WAV buffer is at the beginning
#                     wav_io.seek(0)

#                     # Remove the temporary file after use
#                     os.remove(temp_audio_file_path)

#                     with sr.AudioFile(wav_io) as source:
#                         audio = recognizer.record(source)
#                         try:
#                             transcript = recognizer.recognize_google(audio)
#                             await websocket.send_text(f'{{"transcript": "{transcript}"}}')
#                         except sr.UnknownValueError:
#                             await websocket.send_text('{"transcript": "Could not understand audio"}')
#                         except sr.RequestError as e:
#                             await websocket.send_text(f'{{"transcript": "Speech recognition error: {str(e)}"}}')

#                 except Exception as e:
#                     logging.error(f"Error processing audio: {str(e)}")
#                     await websocket.send_text(f'{{"transcript": "Audio processing failed: {str(e)}"}}')

#         await websocket.close()

#     except Exception as e:
#         logging.error(f"WebSocket error: {str(e)}")
#     finally:
#         await websocket.close()
#         logging.info("WebSocket connection closed")








# import datetime
# import io
# from fastapi import FastAPI, WebSocket
# from fastrtc import stream  # Import the stream from fastrtc
# from pydub import AudioSegment
# import wave

# app = FastAPI()

# # WebSocket endpoint to receive audio
# @app.websocket("/ws")
# async def audio_stream(websocket: WebSocket):
#     await websocket.accept()
#     audio_data = b""

#     try:
#         while True:
#             data = await websocket.receive_bytes()
#             audio_data += data  # Append received data to audio_data
#     except Exception as e:
#         print("Error or WebSocket closed:", e)

#     # Save the audio data as a .webm file first
#     timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
#     webm_file = f"recording_{timestamp}.webm"
#     with open(webm_file, "wb") as f:
#         f.write(audio_data)

#     # Convert the .webm file to .wav using pydub
#     try:
#         audio = AudioSegment.from_file(webm_file, format="webm")
#         wav_file = f"recording_{timestamp}.wav"
#         audio.export(wav_file, format="wav")
#         print(f"Saved: {wav_file}")
#     except Exception as e:
#         print(f"Error in conversion: {e}")

#     # Send back an acknowledgment
#     await websocket.send_text(f"Audio saved as {wav_file}")




#////////////////////////////LAST working code

# import datetime
# import io
# from fastapi import FastAPI, WebSocket
# from fastrtc import stream  # Import the stream from fastrtc
# from pydub import AudioSegment
# import wave
# import speech_recognition as sr

# app = FastAPI()

# # Function to transcribe audio to text
# def transcribe_audio(audio_path):
#     recognizer = sr.Recognizer()
#     try:
#         with sr.AudioFile(audio_path) as source:
#             audio_data = recognizer.record(source)
#             text = recognizer.recognize_google(audio_data)
#             return text
#     except Exception as e:
#         print(f"Error during transcription: {e}")
#         return None


# # WebSocket endpoint to receive audio
# @app.websocket("/ws")
# async def audio_stream(websocket: WebSocket):
#     await websocket.accept()
#     audio_data = b""

#     try:
#         while True:
#             data = await websocket.receive_bytes()
#             audio_data += data  # Append received data to audio_data
#     except Exception as e:
#         print("Error or WebSocket closed:", e)

#     # Save the audio data as a .webm file first
#     timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
#     webm_file = f"recording_{timestamp}.webm"
#     with open(webm_file, "wb") as f:
#         f.write(audio_data)

#     # Convert the .webm file to .wav using pydub
#     try:
#         audio = AudioSegment.from_file(webm_file, format="webm")
#         wav_file = f"recording_{timestamp}.wav"
#         audio.export(wav_file, format="wav")
#         print(f"Saved: {wav_file}")
#     except Exception as e:
#         print(f"Error in conversion: {e}")

#     # Transcribe the audio to text
#     transcription = transcribe_audio(wav_file)

#     if transcription:
#         print(f"Transcription: {transcription}")
#     else:
#         transcription = "Transcription failed."

#     # Send back the transcription as a WebSocket message
#     await websocket.send_text(f"Transcription: {transcription}")



# @app.websocket("/ws")
# async def audio_stream(websocket: WebSocket):
#     await websocket.accept()
#     audio_data = b""
    
#     try:
#         while True:
#             message = await websocket.receive()
#             if message["type"] == "websocket.disconnect":
#                 print("Client disconnected")
#                 break
#             elif message["type"] == "websocket.receive" and "bytes" in message:
#                 audio_data += message["bytes"]
#     except Exception as e:
#         print("WebSocket receive error:", e)

#     # Process audio after client stops sending
#     timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
#     webm_file = f"recording_{timestamp}.webm"
#     wav_file = f"recording_{timestamp}.wav"

#     with open(webm_file, "wb") as f:
#         f.write(audio_data)

#     try:
#         audio = AudioSegment.from_file(webm_file, format="webm")
#         audio.export(wav_file, format="wav")
#     except Exception as e:
#         print("Conversion error:", e)
#         await websocket.send_text("Audio conversion failed.")
#         await websocket.close()
#         return

#     # Transcription
#     transcription = transcribe_audio(wav_file)
#     print(f"Transcription: {transcription}")
    
#     try:
#         await websocket.send_text(transcription)
#         await websocket.close()
#     except Exception as e:
#         print("WebSocket was already closed before sending transcription.", e)
    
    # await websocket.close()



#====================last working code

# import asyncio
# import json
# import numpy as np
# from fastapi import FastAPI, WebSocket, WebSocketDisconnect
# from aiortc import RTCPeerConnection, RTCSessionDescription, RTCConfiguration, RTCIceServer, MediaStreamTrack
# from vosk import Model, KaldiRecognizer
# from av.audio.frame import AudioFrame

# app = FastAPI()

# configuration = RTCConfiguration(iceServers=[])
# pc = RTCPeerConnection(configuration=configuration)

# # Load Vosk model (path to your downloaded model directory)
# model = Model("C:/Users/Lakshmi Narayana/Desktop/vosk-model-en-us-0.22/vosk-model-en-us-0.22")

# class AudioTrackProcessor(MediaStreamTrack):  # Now this will work
#     kind = "audio"

#     def __init__(self, track, websocket: WebSocket):
#         super().__init__()
#         self.track = track
#         self.websocket = websocket
#         self.recognizer = KaldiRecognizer(model, 16000)
#         self.audio_buffer = b""

#     async def recv(self):
#         frame: AudioFrame = await self.track.recv()

#         pcm_bytes = frame.to_ndarray().tobytes()
#         self.audio_buffer += pcm_bytes

#         # Process the audio buffer once it's large enough
#         if len(self.audio_buffer) >= 4000 * 2:
#             if self.recognizer.AcceptWaveform(self.audio_buffer):
#                 result_json = self.recognizer.Result()
#                 result = json.loads(result_json)
#                 text = result.get("text", "")
#                 if text:
#                     try:
#                         # Print the transcript to the terminal
#                         print(f"Transcribed Text: {text}")  # Display the transcript in the terminal
#                         await self.websocket.send_json({"transcript": text})
#                     except Exception as e:
#                         print("Failed to send transcript:", e)
#                 self.audio_buffer = b""

#         return frame


# @app.websocket("/ws")
# async def websocket_endpoint(websocket: WebSocket):
#     await websocket.accept()
#     print("INFO: connection open")

#     try:
#         offer = await websocket.receive_json()
#         pc = RTCPeerConnection()

#         @pc.on("track")
#         def on_track(track):
#             if track.kind == "audio":
#                 print("Audio track received")
#                 local_audio = AudioTrackProcessor(track, websocket)
#                 pc.addTrack(local_audio)

#         await pc.setRemoteDescription(
#             RTCSessionDescription(sdp=offer["sdp"], type=offer["type"])
#         )

#         answer = await pc.createAnswer()
#         await pc.setLocalDescription(answer)

#         try:
#             await websocket.send_json({
#                 "sdp": pc.localDescription.sdp,
#                 "type": pc.localDescription.type
#             })
#         except Exception as e:
#             print("Failed to send SDP answer:", e)
#             await pc.close()
#             return

#         # Keep connection open until WebSocket is closed
#         while True:
#             await asyncio.sleep(1)

#     except WebSocketDisconnect:
#         print("INFO: WebSocket disconnected")

#     except Exception as e:
#         print("Unhandled error:", e)

#     finally:
#         print("INFO: connection closed")
#         if 'pc' in locals():
#             await pc.close()




















# Run FastAPI server with Uvicorn
# uvicorn speechtotext:app --host 0.0.0.0 --port 7860 --reload





# from fastrtc import Stream, ReplyOnPause, get_stt_model
# import numpy as np

# # Load STT model
# model = get_stt_model(model="moonshine/base")

# # Function to process audio and print transcript
# def transcribe_audio(audio: tuple[int, np.ndarray]):
#     text = model.stt(audio)
#     print(f"Transcribed Text: {text}")
#     yield audio  # stream continues

# # Create FastRTC stream for audio
# stream = Stream(
#     ReplyOnPause(transcribe_audio),
#     modality="audio",
#     mode="send-receive"
# )

# # Start FastRTC UI (this launches a local signaling + media server)
# stream.ui.launch()



# main.py
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydub import AudioSegment
from vosk import Model, KaldiRecognizer
import wave
import os
import time

# Initialize FastAPI app
app = FastAPI()

# CORS setup to allow requests from React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the Vosk model
model_path = "C:/Users/Lakshmi Narayana/Desktop/vosk-model-en-us-0.22/vosk-model-en-us-0.22"
model = Model(model_path)

@app.post("/upload-audio")
async def upload_audio(file: UploadFile = File(...)):
    temp_webm = "temp.webm"
    temp_wav = "temp.wav"

    # Read uploaded file content
    contents = await file.read()
    print(f"Uploaded file size: {len(contents)} bytes")

    with open(temp_webm, "wb") as f:
        f.write(contents)

    # Convert WebM to 16kHz mono WAV using pydub
    try:
        audio = AudioSegment.from_file(temp_webm, format="webm")
        print(f"WAV Conversion Duration (ms): {len(audio)}")
        print(f"Original: Channels={audio.channels}, Frame Rate={audio.frame_rate}")

        # Convert to 16kHz mono PCM
        audio = audio.set_frame_rate(16000).set_channels(1)
        audio.export(temp_wav, format="wav", codec="pcm_s16le")

        print(f"Exported WAV - Channels: {audio.channels}, Frame Rate: {audio.frame_rate}")
        print(f"WAV file saved: {temp_wav}")
    except Exception as e:
        return {"error": f"Error during audio conversion: {str(e)}"}

    # Transcribe audio using Vosk
    try:
        wf = wave.open(temp_wav, "rb")
        rec = KaldiRecognizer(model, wf.getframerate())
        transcript = ""

        while True:
            data = wf.readframes(4000)
            if len(data) == 0:
                break
            if rec.AcceptWaveform(data):
                result = rec.Result()
                print(f"Accepted result: {result}")
                text = eval(result).get("text", "")
                transcript += text + " "
            else:
                print(f"Partial result: {rec.PartialResult()}")

        # Get final result after stream ends
        result = rec.FinalResult()
        final_text = eval(result).get("text", "")
        if final_text:
            print(f"Final result: {result}")
            transcript += final_text

        wf.close()
    except Exception as e:
        return {"error": f"Error during transcription: {str(e)}"}

    # Cleanup temporary files
    try:
        time.sleep(1)  # Ensure file handles are closed
        os.remove(temp_webm)
        os.remove(temp_wav)
    except Exception as e:
        print(f"Error cleaning up files: {str(e)}")

    print(f"✔ Final Transcript: {transcript.strip()}")
    return {"transcript": transcript.strip()}






