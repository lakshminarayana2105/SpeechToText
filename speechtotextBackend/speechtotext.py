# main.py
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from vosk import Model, KaldiRecognizer
import wave
import os
import time

# Initialize FastAPI app
app = FastAPI()

# Allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your React app
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the Vosk model
model_path = "C:/Users/Lakshmi Narayana/Desktop/vosk-model-en-us-0.22/vosk-model-en-us-0.22"
model = Model(model_path)

@app.post("/upload-audio")
async def upload_audio(file: UploadFile = File(...)):
    temp_wav = "temp.wav"

    # Save uploaded WAV file
    contents = await file.read()
    with open(temp_wav, "wb") as f:
        f.write(contents)

    print(f"✔ Uploaded WAV: {temp_wav}, Size: {len(contents)} bytes")

    # Transcribe using Vosk
    try:
        wf = wave.open(temp_wav, "rb")
        print(f"Channels: {wf.getnchannels()}, Frame Rate: {wf.getframerate()}")

        rec = KaldiRecognizer(model, wf.getframerate())
        transcript = ""

        while True:
            data = wf.readframes(4000)
            if not data:
                break
            if rec.AcceptWaveform(data):
                result = rec.Result()
                print("Accepted:", result)
                transcript += eval(result).get("text", "") + " "
            else:
                print("Partial:", rec.PartialResult())

        result = rec.FinalResult()
        final_text = eval(result).get("text", "")
        if final_text:
            transcript += final_text
            print("Final result:", final_text)

        wf.close()
    except Exception as e:
        return {"error": f"Transcription error: {str(e)}"}

    # Clean up temp file
    try:
        time.sleep(1)
        os.remove(temp_wav)
    except Exception as e:
        print(f"Cleanup error: {str(e)}")

    print("✔ Final Transcript:", transcript.strip())
    return {"transcript": transcript.strip()}

