import { initUi, renderLayers } from './ui.js';

let passthrough = false;
const layers = [];

console.log('starting looper!');
const AudioContext = window.AudioContext || window.webkitAudioContext;

const context = new AudioContext();
let mic, mediaStream;
const speaker = context.destination;

// Being lazy for now, requiring mic access on page load:
navigator.mediaDevices.getUserMedia({
  audio: true,
})
.then((_mediaStream) => {
  console.log(_mediaStream);
  mediaStream = _mediaStream;
  const mic = new MediaStreamAudioSourceNode(context, { mediaStream });
  initUi(context, mic, speaker, mediaStream, layers);
});
