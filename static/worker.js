onmessage = e => {
  if (e.data[0] == 'config') {
    self.Mp3LameEncoderConfig = {
      TOTAL_MEMORY: Math.floor(1000000 * e.data[3] * 1.1)
    };
    importScripts("/Mp3LameEncoder.js");
    encoder = new Mp3LameEncoder(e.data[1], e.data[2]);
    postMessage(["next"]);
  } else if (e.data[0] == 'post') {
    encoder.encode([e.data[1], e.data[2]]);
    postMessage(["next"]);
  } else if (e.data[0] == 'cancel') {
    encoder.cancel();
  } else {
    const blob = encoder.finish();
    postMessage(["done", blob]);
  }
}
