//source code: https://github.com/mdn/dom-examples/blob/main/media/web-dictaphone/index.html

// set up basic variables for app
var Chat = {

    response: null,

    init: function () {
        const record = document.querySelector("#mic");
        const stop = document.querySelector("#stoprec");
        const soundClips = document.querySelector('.sound-clips');
        const canvas = document.querySelector('.visualizer');
        const mainSection = document.querySelector('.main-controls');
        const xhr = new XMLHttpRequest();

        // disable stop button while not recording
        stop.disabled = true;

        // visualiser setup - create web audio api context and canvas
        let audioCtx;
        const canvasCtx = canvas.getContext("2d");
        audioRecording();
        
        function audioRecording() {
            //audio recording
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
            
                    stop.disabled = true;
                    record.disabled = false;
                }
            
                mediaRecorder.onstop = function(e) {
                    console.log("data available after MediaRecorder.stop() called.");
                    
                //to listen to your recording
                    const blob = new Blob(chunks, { 'type' : 'audio/wav' });
            
                    //const xhr = new XMLHttpRequest();
                    xhr.open("POST", "http://127.0.0.1:8000/transcribe", true);
                    xhr.setRequestHeader("Content-Type", "audio/wav");
                    xhr.send(blob);
                
                    xhr.onreadystatechange = function() {
                    if (xhr.readyState === XMLHttpRequest.DONE) {
                        if (xhr.status === 200) {
                        // Parse the response JSON into a JavaScript object
                        const responseData = JSON.parse(xhr.response);
                        Chat.response = responseData;
                        // Do something with the parsed response data
                        console.log(responseData.query_transcription);
                        console.log(responseData.lang);
                        console.log(responseData.response_transcription);
                        console.log(responseData.audio_path);
            
                        showPrompt();
                        
                        // const msg = new SpeechSynthesisUtterance(responseData.response_transcription);
                        // let synth = window.speechSynthesis;
                        // selectVoice(synth, responseData.lang, msg);
                        // var source = "../"+responseData.audio_path;
                        var source = "./src/response"+responseData.rand+".mp3";
                        var audio = document.createElement("audio");
                        audio.src = source;
                        audio.autoplay = true;
                        audio.load()
                        audio.addEventListener("load", function() { 
                        audio.play(); 
                        }, true);
                        audio.addEventListener("ended", function() {
                        Chat.response = null;
                        }, true);
                        showResponse();

                        return responseData;
                        } else {
                        console.error('Error:', xhr.statusText);
                        }
                    }
                    };
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
    
        };

        // function textPrompt() {
        //     const textarea = document.querySelector("textarea");
        //     textarea.addEventListener("keydown", inputText.bind(this)); // send message on Enter
        //     this.sendButton.onclick = this.inputText.bind(this); // send message on "send" button click
        // }
        
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
          
            draw();
            function draw() {
                
                const WIDTH = canvas.width;
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
        };
        
        function showPrompt() {
            const container = document.querySelector("#container")
            var prompt = document.createElement("div");
            prompt.className = "prompt";
            prompt.innerHTML = "you: "+Chat.response.query_transcription;
            container.appendChild(prompt);
            container.scrollTop = 1000000;
        };

        function showResponse() {
            const container = document.querySelector("#container")
            var res = document.createElement("div");
            res.className = "response";
            res.innerHTML = "EVA: "+Chat.response.response_transcription;
            container.appendChild(res);
            container.scrollTop = 1000000;
        }

        window.onresize = function() {
            canvas.width = mainSection.offsetWidth;
        }
          
        window.onresize();
    },

    
    
};


