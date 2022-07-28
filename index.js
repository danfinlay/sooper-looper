import { initUi } from './ui.js';
const AudioContext = window.AudioContext || window.webkitAudioContext;

console.log('starting looper!');

const layers = [];
const context = new AudioContext();
const speaker = context.destination;
let mediaStream;

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
