import { createLayer, recorderToAudioBuffer } from './layer.js'
console.log('ui loaded');

export function renderLayers (layers) {
  const ui = document.getElementById('loopStatus');
  ui.innerHTML = '';
  layers.forEach((layer, index) => {

    const div = document.createElement('div');

    const button = document.createElement('button');
    button.innerText = `Layer ${index}` + (layer.muted ? ' (muted)' : '');
    button.addEventListener('click', () => {
      console.log(`Layer ${index} clicked`);
      layer.toggleMute();
      button.innerText = `Layer ${index}` + (layer.muted ? ' (muted)' : '');
    });
    div.appendChild(button);

    ui.prepend(div);
  });
}

export function initUi (context, mic, speaker, mediaStream, layers) {
  passthroughCheckbox.addEventListener('change', (event) => {
    if (event.target.checked) {
      mic.connect(speaker);
    } else {
      mic.disconnect(speaker);
    }
  });

  console.log('DOM fully loaded and parsed');
  let isRecording = false;
  let recorder;
  startStop.addEventListener('click', () => {
    if (!isRecording) {
      isRecording = true;
      startStop.innerText = 'Stop Recording';
      recorder = new MediaRecorder(mediaStream);
      recorder.start();
    } else {
      isRecording = false;
      stopRecording(recorder, layers, context, speaker);
    }
  });
}

function stopRecording (recorder, layers, context, speaker) {
  startStop.innerText = 'Start Recording';
  recorderToAudioBuffer(context, recorder)
  .then((audioBuffer) => {
    const layer = createLayer(context, speaker, audioBuffer);
    layer.start();
    layers.push(layer);
    renderLayers(layers);
  })
  .catch(defaultFailure);
}

function defaultFailure (reason) {
  console.error(reason);
  alert('Had a problem, open console for details.');
}
