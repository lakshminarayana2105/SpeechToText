
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






