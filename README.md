# NLI-EVA
Open website folder and then open index.html for the interface

You also need to run the following servers:
rasa run actions (for actions server)

rasa run -m models --enable-api -p 5055 --cors "*" --credentials credentials.yml (for the rasa server + webhook)

uvicorn pyserver:app --reload (for the python server linking everything together)


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
