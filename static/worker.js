importScripts("/Mp3LameEncoder.js");
onmessage = e => {
    if (e.data[0] == 'config') {
        encoder = new Mp3LameEncoder(e.data[1], e.data[2]);
        postMessage(["next"]);
    } else if (e.data[0] == 'post') {
        encoder.encode([e.data[1], e.data[2]]);
        postMessage(["next"]);
    } else if (e.data[0] == 'cancel') {
        encoder.cancel();
    } else {
        const blob = encoder.finish();
        postMessage(["done",blob ]);
    }
}