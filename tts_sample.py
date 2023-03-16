from gtts import gTTS
import re
import playsound


import requests

headers = {
    'Content-Type': 'application/json',
}

json_data = {
    'sender': 'test_user',
    'message': 'how many people are in ai',
    'input_channel': 'rest',
    'metadata': {},
}

response = requests.post('http://localhost:5005/webhooks/rest/webhook', headers=headers, json=json_data)
text = response.text
text = re.search( "(?<=text\":\")(.*)(?=\")",text  ).group()
tts = gTTS(text)
tts.save('hello.mp3')
playsound.playsound('hello.mp3', True)

