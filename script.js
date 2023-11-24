const microphone = document.getElementById("microphone");
const music = document.getElementById("music");
const volumeMeter = document.getElementById("volume")

let isInitialClick = true;
let isListening = false;
let audioContext = null;
let source = null;
let scriptNode = null;


function changeIcon() {
    if (isListening){
        microphone.src = "assets/microphoneFull.png";
    } else{
        microphone.src = "assets/microphoneEmpty.png";
    }
    
}
console.log(music.play())

microphone.addEventListener("mousedown", function(event) {
  if (event.button === 0) {
    if (isInitialClick) {
      isInitialClick = false;
      isListening = true;
      
      startListening();
      changeIcon();
    }
  }
});

microphone.addEventListener("mouseup", function(event) {
  if (event.button === 0) {
    isListening = false;
    changeIcon();
      
    startListening();
    isInitialClick = true; // Reset for the next initial click
  }
});

microphone.addEventListener("mouseleave", function(event) {
  if (isInitialClick) {
    isInitialClick = true; // Reset if mouse leaves without starting
  }
});

function startListening() {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(function(stream) {
      audioContext = new AudioContext();
      source = audioContext.createMediaStreamSource(stream);
      scriptNode = audioContext.createScriptProcessor(2048, 1, 1);
      scriptNode.onaudioprocess = function(audioProcessingEvent) {
        const inputBuffer = audioProcessingEvent.inputBuffer;
        const inputData = inputBuffer.getChannelData(0);
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += Math.abs(inputData[i]);
        }
        const avg = sum / inputData.length;
        const decibels = 20 * Math.log10(avg);
        if (!isInitialClick) {
          const scaledVolume = (decibels + 100) / 100;
          music.volume = Math.min(Math.max(scaledVolume, 0), 1);

          const volumePercentage = Math.round(scaledVolume * 100);
          volumeMeter.innerText = `${volumePercentage}%`
        }
      };
      source.connect(scriptNode);
      scriptNode.connect(audioContext.destination);
    })
    .catch(function(err) {
      console.error('Error accessing the microphone:', err);
      alert("Cannot access microphone");
    });
}

function stopListening() {
  if (audioContext) {
    scriptNode.disconnect();
    source.disconnect();
    audioContext.close();
    audioContext = null;
    source = null;
    scriptNode = null;
    music.volume = 1; // Reset volume when stopping
  }
}