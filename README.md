# NLI-EVA
Open website folder and then open index.html for the interface. Before you get started, you need to get some servers running:

//RASA ACTIONS
rasa run actions (for actions server)

//RASA SERVER + WEBHOOK
rasa run -m models --enable-api -p 5055 --cors "*" --credentials credentials.yml (for the rasa server + webhook)

//PYTHON SERVER INTERFACE-RASA
uvicorn pyserver:app --reload (for the python server linking everything together)

//INTERFACE
//(commands for macs)
install sudo npm install -g http-server and run: http-server
this will run a local server at a port > visit http://localhost:port/ to access the interface and finally interact with EVA!


For the last one, you will probably need to install some libraries, including uvicorn and others which you may need and you can check them by looking at what is imported in the pyserver.py file. 

For your reference, those are the libraries used in this server, some of which you may need to download:

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

import playsound

from deep_translator import GoogleTranslator
