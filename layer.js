console.log('layer..js loaded');

export async function recorderToAudioBuffer (context, recorder) {

  return new Promise ((res, rej) => {
    recorder.requestData()
    recorder.addEventListener("dataavailable", newBlob);
    
    function newBlob (event) {
      recorder.removeEventListener("dataavailable", newBlob);
      const blob = event.data;

      res(blobToAudioBuffer(context, blob));
    }
  });
}

async function blobToAudioBuffer (context, blob) {
  return new Promise ((res, rej) => {
    let fileReader = new FileReader();
    fileReader.onloadend = () => {
      // const audioBuffer = bufferToAudioBuffer(context, fileReader.result);
      res(context.decodeAudioData(fileReader.result));
    }
    fileReader.readAsArrayBuffer(blob);
  });
}

function bufferToAudioBuffer (context, buffer) {
  const audioBuffer = context.createBuffer(1, buffer.byteLength, context.sampleRate);
  const nowBuffering = audioBuffer.getChannelData(0);
  for (let i = 0; i < buffer.length; i++) {
    nowBuffering[i] = buffer[i];
  };
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
  console.log('setting volume to ', lastVolume);
  gainNode.gain.setValueAtTime(context.currentTime, lastVolume);
  
  return {
    get volume () { return gainNode.gain.value; },
    get muted () { return muted },
    toggleMute () {
      muted = !muted;
      gainNode.gain.setValueAtTime(context.currentTime, muted ? 0 : lastVolume);
    },
    set volume (newValue) {
      gainNode.gain.setValueAtTime(context.currentTime, newValue);
    },
    start () {
      console.log('loop starting');
      source.start();
    },
  }
}
