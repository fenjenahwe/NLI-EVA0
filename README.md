# NLI-EVA

Before you get started, you need to get some servers running:

# Rasa actions

Run this command in the folder:
rasa run actions

# Rasa chatbot

A pretrained model is provided. You can always retrain according to edits by running:

rasa train

Run this command to get the Rasa server running:

rasa run -m models --enable-api -p 5055 --cors "*" --credentials credentials.yml

# Python server (interface-rasa)

Install the libraries needed in the pyserver.py* file and run this command (macos) to get the python server running:

uvicorn pyserver:app --reload

# Interface

(commands for macos)

install sudo npm install -g http-server 

Run a local server: 

http-server

visit http://localhost:port/ to access the interface and finally interact with EVA!


# libraries 

*For your reference, the libraries used in the python server include:

whisper

requests

from fastapi import FastAPI, Request, HTTPException

from fastapi.encoders import jsonable_encoder

from pydantic import BaseModel

from io import BytesIO

from pydub import AudioSegment

from pydub.utils import which

from fastapi.middleware.cors import CORSMiddleware

from gtts import gTTS

re

playsound

from deep_translator import GoogleTranslator
