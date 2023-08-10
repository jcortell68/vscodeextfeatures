console.log("ww: This message is generated by the Web Worker.");

onmessage = function(e) {
    console.log('ww: Worker: Message received from main script');
    const msg = e.data[0];
    if (msg === 'How are you holding up?') {
        postMessage(["Can't complain."]);
    }
    else {
        postMessage(["Huh?"]);
    }
};

