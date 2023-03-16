import whisper
import requests
from fastapi import FastAPI, Request, HTTPException
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from io import BytesIO
from pydub import AudioSegment
from pydub.utils import which
from fastapi.middleware.cors import CORSMiddleware
from gtts import gTTS
import re
import random
import playsound
from deep_translator import GoogleTranslator

app = FastAPI()

# configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class MyResponse(BaseModel):
    query_transcription: str
    lang: str
    response_transcription: str
    audio_path: str


@app.post("/transcribe")
async def transcribe(request: Request):
    content_type = request.headers.get("Content-Type")
    if not content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="Invalid Content-Type")

    audio_data = await request.body()
    AudioSegment.converter = which("ffmpeg")
    audio = AudioSegment.from_file(BytesIO(audio_data))
    audio.export('test.wav', format="wav")
    # play(audio)
    # data = np.array(audio.get_array_of_samples())
    # print("first array", data)
    # data = data.astype(np.float32, order='C')
    # data = data/np.max(np.abs(data), axis=0)
    # data = data.astype(np.float32, order='C')
    # print("second array", data)
    # soundfile.write('test.wav', data, 44100,  subtype='FLOAT')
    # Load Whisper model
    model = whisper.load_model("base")

    # Transcribe Whisper audio
    result = model.transcribe('test.wav', task="translate", fp16=False)
    transcription = result["text"]
    lang = result["language"]
    print(lang)
    print(transcription)

    #Contact RASA
    headers = {
        'Content-Type': 'application/json',
    }

    json_data = {
        'sender': 'test_user',
        'message': transcription,
        'input_channel': 'rest',
        'metadata': {},
    }

    response = requests.post('http://localhost:5005/webhooks/rest/webhook', headers=headers, json=json_data)
    print("response", response)

    #TTS
    text = response.text
    print("text", text)
    text = re.search("(?<=text\":\")(.*)(?=\")", text).group()
    print(text)
    if lang != 'en':
        # TRANSLATION
        text = GoogleTranslator(source='auto', target=lang).translate(text)
    tts = gTTS(text, lang=lang)

    rand = random.randint(0, 9)
    filepath = "response{}.mp3".format(rand)
    tts.save(filepath)
    # playsound.playsound('response.mp3', True)

    response_data = MyResponse(query_transcription=transcription, lang=lang, response_transcription=text,
                               audio_path=filepath)
    response_json = jsonable_encoder(response_data)

    return response_json
