//source code: https://github.com/mdn/dom-examples/blob/main/media/web-dictaphone/index.html

// set up basic variables for app
// const socket = new WebSocket('ws://localhost:8000/listen')

const record = document.querySelector("#mic");
const stop = document.querySelector("#stoprec");

const soundClips = document.querySelector('.sound-clips');
const canvas = document.querySelector('.visualizer');
const mainSection = document.querySelector('.main-controls');

// disable stop button while not recording

stop.disabled = true;

// visualiser setup - create web audio api context and canvas

let audioCtx;
const canvasCtx = canvas.getContext("2d");

//main block for doing the audio recording

if (navigator.mediaDevices.getUserMedia) {
  console.log('getUserMedia supported.');

  const constraints = { audio: true };
  let chunks = [];

  let onSuccess = function(stream) {
    const mediaRecorder = new MediaRecorder(stream);

    visualize(stream);

    record.onclick = function() {
      mediaRecorder.start();
      console.log(mediaRecorder.state);
      console.log("recorder started");

      record.style.background = "red";

      stop.disabled = false;
      record.disabled = true;
    }

    stop.onclick = function() {
      mediaRecorder.stop();
      console.log(mediaRecorder.state);
      console.log("recorder stopped");
      record.style.background = "";
      record.style.color = "";
    //   mediaRecorder.requestData();

      stop.disabled = true;
      record.disabled = false;
    }

    mediaRecorder.onstop = function(e) {
      console.log("data available after MediaRecorder.stop() called.");
        
     //to listen to your recording
      const blob = new Blob(chunks, { 'type' : 'audio/wav' });

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "http://127.0.0.1:8000/transcribe", true);
      xhr.setRequestHeader("Content-Type", "audio/wav");
      xhr.send(blob);
    
      xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            // Parse the response JSON into a JavaScript object
            const responseData = JSON.parse(xhr.response);
            // Do something with the parsed response data
            console.log(responseData.query_transcription);
            console.log(responseData.lang);
            console.log(responseData.response_transcription);
            console.log(responseData.audio_path);

            // const msg = new SpeechSynthesisUtterance(responseData.response_transcription);
            // let synth = window.speechSynthesis;
            // selectVoice(synth, responseData.lang, msg);
            var source = "../"+responseData.audio_path;
            var audio = document.createElement("audio");
            audio.src = source;
            audio.autoplay = true;
            audio.load()
            audio.addEventListener("load", function() { 
            audio.play(); 
        }, true);
            

            return responseData;
          } else {
            console.error('Error:', xhr.statusText);
          }
        }
      };

      function setSpeech(synth) {
        return new Promise(
            function (resolve, reject) {
                let id;
                id = setInterval(() => {
                    if (synth.getVoices().length !== 0) {
                        resolve(synth.getVoices());
                        clearInterval(id);
                    }
                }, 10);
            }
        )
    }

      async function selectVoice(synth, lang, msg) {
        voices = await setSpeech(synth);
            for (let i = 0; i < voices.length; i++) {
            if (voices[i].lang.startsWith(lang)) {
                msg.voice = voices[i];
                synth.speak(msg);
                return msg;
            }
            }
        }
        
        

      chunks = [];

    }

    mediaRecorder.ondataavailable = function(e) {
      chunks.push(e.data);
      console.log("just pushed to chunks:" + e + "esp." + e.data);
    }
  }

  let onError = function(err) {
    console.log('The following error occured: ' + err);
  }

  navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);

} else {
   console.log('getUserMedia not supported on your browser!');
}

function visualize(stream) {
  if(!audioCtx) {
    audioCtx = new AudioContext();
  }

  const source = audioCtx.createMediaStreamSource(stream);

  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  source.connect(analyser);
  //analyser.connect(audioCtx.destination);

  draw()

  function draw() {
    const WIDTH = canvas.width
    const HEIGHT = canvas.height;

    requestAnimationFrame(draw);

    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = 'rgb(200, 200, 200)';
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

    canvasCtx.beginPath();

    let sliceWidth = WIDTH * 1.0 / bufferLength;
    let x = 0;


    for(let i = 0; i < bufferLength; i++) {

      let v = dataArray[i] / 128.0;
      let y = v * HEIGHT/2;

      if(i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height/2);
    canvasCtx.stroke();

  }
}

window.onresize = function() {
  canvas.width = mainSection.offsetWidth;
}

window.onresize();
