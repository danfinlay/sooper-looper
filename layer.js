console.log('layer.js loaded');

export async function recorderToAudioBuffer (context, recorder, layers) {

  return new Promise ((res, rej) => {
    recorder.requestData()
    recorder.addEventListener("dataavailable", newBlob);
    
    function newBlob (event) {
      recorder.removeEventListener("dataavailable", newBlob);
      const blob = event.data;

      res(blobToAudioBuffer(context, blob, layers));
    }
  });
}

async function blobToAudioBuffer (context, blob, layers) {
  return new Promise ((res) => {
    let fileReader = new FileReader();
    fileReader.onloadend = () => {

      // If this is the first clip, we can use it as recorded:
      if (layers.length === 0) {
        res(context.decodeAudioData(fileReader.result));

      // If this is not the first clip, we need to pad it to the measure length:
      } else {

        context.decodeAudioData(fileReader.result)
        .then((buffer) => {
          console.log('buffer', buffer);
          console.log('layer0', layers[0]);

          res(createPaddedBuffer(context, buffer, layers[0]));
        });
      }
    }
    fileReader.readAsArrayBuffer(blob);
  });
}

function createPaddedBuffer (context, buffer, baseLayer) {
  const targetLength = shortestDivisible(buffer.length, baseLayer.buffer.length);

  const paddedBuffer = context.createBuffer(1, targetLength, buffer.sampleRate);
  const paddedBufferChannel = paddedBuffer.getChannelData(0);
  const bufferChannel = buffer.getChannelData(0);

  for (let i = 0; i < buffer.length; i++) {
    if (i < buffer.length) {
      paddedBufferChannel[i] = bufferChannel[i];
    } else {
      paddedBufferChannel[i] = 0;
    }
  }

  return paddedBuffer;
}

export function shortestDivisible (length, divisor) {
  return Math.floor(length / divisor) * divisor;
}

export function createLayer (context, speaker, audioBuffer) {
  let source = context.createBufferSource();

  source.buffer = audioBuffer;
  source.loop = true;
  let muted = false;
  var gainNode = context.createGain();
  
  source.connect(gainNode);
  gainNode.connect(speaker);

  let lastVolume = gainNode.gain.value || 1;
  gainNode.gain.setValueAtTime(context.currentTime, lastVolume);

  let i = 0;
  return {
    get volume () { return gainNode.gain.value; },
    get muted () { return muted },
    toggleMute () {
      muted = !muted;
      const newVolume = muted ? 0 : lastVolume;
      gainNode.gain.setValueAtTime(newVolume, 0);
    },
    set volume (newValue) {
      gainNode.gain.setValueAtTime(lastVolume, 0);
    },
    start () {
      source.start();
    },
    get buffer () { return audioBuffer },
  }
}
