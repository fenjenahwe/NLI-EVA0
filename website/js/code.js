//source code: https://github.com/mdn/dom-examples/blob/main/media/web-dictaphone/index.html

// set up basic variables for app
var Chat = {

    response: null,
    stopaudio: null,
    toggle: "voice",
    textarea: document.querySelector("textarea"),

    init: function () {
        const record = document.querySelector("#mic");
        const stop = document.querySelector("#stoprec");
        const soundClips = document.querySelector('.sound-clips');
        const canvas = document.querySelector('.visualizer');
        const mainSection = document.querySelector('.main-controls');
        const xhr = new XMLHttpRequest();
        // const tog = document.querySelector(".switch");
        // const slid = document.querySelector("span");
        // tog.addEventListener("click", function() {
        //     if (slid.innerHTML == "Audio Channel Enabled")
        //         {   
        //             // slid.innerHTML = "Text Channel Enabled";
        //             Chat.toggle = "text";
        //         }
        //     }); 

        // tog.addEventListener("click", function() {
        //     if (slid.innerHTML == "Text Channel Enabled")
        //         {
        //             // slid.innerHTML = "Audio Channel Enabled";
        //             Chat.toggle = "voice";
        //         }
        //     }); 

        // disable stop button while not recording
        stop.disabled = true;
        

        // visualiser setup - create web audio api context and canvas
        let audioCtx;
        const canvasCtx = canvas.getContext("2d");
        audioRecording();
        Chat.textarea.addEventListener("keydown", sendMsg.bind(this));


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
                    const imgcont = document.querySelector("#image");
                    if (imgcont.children.length!=0)
                        imgcont.removeChild(imgcont.firstElementChild)
            
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
                    
                    //send blob to server
                    sendToServer(blob);

                    chunks = [];
                }

                sendToServer = function(e) {
                    //const xhr = new XMLHttpRequest();
                    if (e instanceof Blob)
                    {
                        xhr.open("POST", "http://127.0.0.1:8000/transcribe", true);
                        xhr.setRequestHeader("Content-Type", "audio/wav");
                        xhr.send(e);
                    }

                    if (typeof e == 'string')
                    {
                        xhr.open("POST", "http://127.0.0.1:8000/text", true);
                        xhr.setRequestHeader("Content-Type", "text/plain");
                        xhr.send(e);
                    }
                    
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
                        
                        if(e instanceof Blob)
                            showPrompt();
                        
                        // const msg = new SpeechSynthesisUtterance(responseData.response_transcription);
                        // let synth = window.speechSynthesis;
                        // selectVoice(synth, responseData.lang, msg);
                        // var source = "../"+responseData.audio_path;
                        
                        var source = "./src/response"+responseData.rand+responseData.randletter+".mp3";
                        var audio = document.createElement("audio");
                        audio.src = source;
                        audio.autoplay = true;
                        audio.defaultPlaybackRate = 1.3;
                        var okthx = document.querySelector('#okthx');
                        okthx.style.display = "block";
                        audio.load()
                        audio.addEventListener("load", function() {               
                        audio.play();
                        }, true);
                        okthx.addEventListener("click", function() {
                            audio.pause();
                            okthx.style.display = "none";
                            Chat.stopaudio = 1;
                            Chat.response = null;
                            }); 
                        
                        renderResponseImg();
                    
                        audio.addEventListener("ended", function() {
                        Chat.response = null;
                        okthx.style.display = "none";
                        }, true);

                        showResponse();

                        return responseData;
                        } else {
                        console.error('Error:', xhr.statusText);
                        }
                    }
                    };
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
            if (Chat.toggle == "voice")
                prompt.innerHTML = "you: "+Chat.response.query_transcription;
            if (Chat.toggle == "text")
                prompt.innerHTML = "you: "+Chat.textarea.value;
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
            if (res.innerHTML.includes("http")) {
                const exp = /(https?:\/\/[^\s]+?)(?:\.(\s|$)|\s|$)/;
                const match = res.innerHTML.match(exp);
                const url = match[1];
                res.style.cursor = "pointer";
                res.addEventListener("click", function() {
                    window.open(url)
                    })
                };
            }

        function renderResponseImg() {
            txt = Chat.response.response_transcription;
            const imgcont = document.querySelector("#image");
            var img = document.createElement("img");

            if (txt.includes("cheer")) {
                img.src = "./images/cheerup.jpeg";
            }

            if (txt.includes("510"))
            {
                img.src = "./images/510.png";
            }

            if (txt.includes("511"))
            {
                img.src = "./images/511.png";
            }

            if (txt.includes("550"))
            {
                img.src = "./images/550.png";
            }

            if (txt.includes("551"))
            {
                img.src = "./images/551.png";
            }

            if (txt.includes("552"))
            {
                img.src = "./images/552.png";
            }

            if (txt.includes("553"))
            {
                img.src = "./images/553.png";
            }

            if (txt.includes("554"))
            {
                img.src = "./images/554.png";
            }

            if (txt.includes("You are currently"))
            {
                img.src = "./images/here.gif";
            }

            if (txt.includes("cafeteria"))
            {
                img.src = "./images/cafeteria.png";
            }

            if (txt.includes("library"))
            {
                img.src = "./images/Library.png";
            }

            if (txt.includes("reception"))
            {
                img.src = "./images/reception.png";
            }

            imgcont.appendChild(img);

            // if (Chat.response.response_transcription.includes("map") || Chat.response.response_transcription.includes("building")) {
            //     const imgcont = document.querySelector("#image");
            //     var img = document.createElement("img");
            //     img.src = "./images/mapa-poblenou.png";
            //     imgcont.appendChild(img);
            // }
            
        }


        function sendMsg(event) {
            if (event.key === "Enter" && event.shiftKey) {
                return;
              } else if (event.key === "Enter") {
                event.preventDefault();
                const imgcont = document.querySelector("#image");
                    if (imgcont.children.length!=0)
                        imgcont.removeChild(imgcont.firstElementChild)
                Chat.toggle = "text";
                showPrompt();
                sendToServer(Chat.textarea.value);
                Chat.textarea.value = '';
        }
    }

        window.onresize = function() {
            canvas.width = mainSection.offsetWidth;
        }
          
        window.onresize();
    },

    
    
};


