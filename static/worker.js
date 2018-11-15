importScripts("/Mp3LameEncoder.min.js");

onmessage = e => {
    // if (e.data[0] == 'config') {
    //     console.log("1");
    //     encoder = new Mp3LameEncoder(e.data[1], 192);
    //     console.log("2");
    //     postMessage(["next1"]);
    // } else if (e.data[0] == 'post') {
    //     console.log("a");
    //     encoder.encode([e.data[1], e.data[2]]);
    //     console.log("b");
    //     postMessage(["next2"]);
    // } else {
    //     console.log("c");
    //     const blob = encoder.finish();
    //     console.log("d");
    //     postMessage(["done",blob ]);
    // }
    const encoder = new Mp3LameEncoder(e.data[0],192);
    encoder.encode([e.data[1],e.data[2]]);
    const blob = encoder.finish();
    const r = new FileReader();
    r.onload = e =>{
        console.log(e.target.result);
    }
    r.readAsArrayBuffer(blob);
    //postMessage([]);
}