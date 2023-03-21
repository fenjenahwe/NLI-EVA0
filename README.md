![Eva greeting](https://github.com/fenjenahwe/NLI-EVA0/blob/V2/screenshot.png "Greeting EVA")

# Demo-Video

https://www.youtube.com/watch?v=U4JLH5BoXQQ


# NLI-EVA

Before you get started, you need to get some servers running:

### Rasa actions

Run this command in the folder:

`rasa run actions`

### Rasa chatbot

A pretrained model is provided. You can always retrain according to edits by running:

`rasa train`

Run this command to get the Rasa server running:

`rasa run -m models --enable-api -p 5055 --cors "*" --credentials credentials.yml`

### Python server (interface-rasa)

Install the libraries needed in the pyserver.py* file, install uvicorn and run this command (macos) to get the python server running:

`uvicorn pyserver:app --reload`

### Interface

(commands for macos)

`install sudo npm install -g http-server`

Run a local server: 

`http-server`

visit http://localhost:port/ to access the interface and finally interact with EVA!


### avatar

The 3D avatar used was downloaded and rigged from https://www.mixamo.com/#/?page=1&type=Character

Javi Agenjo's libraries (LiteGL and Rendeer) were used for the 3D canvas.  