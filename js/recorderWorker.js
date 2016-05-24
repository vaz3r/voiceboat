var recLength = 0
    , recBuffersL = []
    , recBuffersR = []
    , bits = 16
    , sampleRate
    , recordAsMP3 = false;

var recBufferMP3 = [];

var mp3Encoder;

var mp3defaultConfig = {
    mode: 3
    , channels: 1
};

this.onmessage = function (e) {
    switch (e.data.command) {
    case 'init':
        init(e.data.config);
        break;
    case 'record':
        record(e.data.buffer);
        break;
            
    case 'getBuffer':
        getBuffer();
        break;

    case 'exportMP3':
        exportMP3();
        break;

    case 'clear':
        clear();
        break;
    }
};

function init(config) {
    sampleRate = config.sampleRate;
    mp3Encoder = new MP3Encoder({
        mp3LibPath: config.mp3LibPath
    });
    recordAsMP3 = config.recordAsMP3 || false;

    if (recordAsMP3) mp3Encoder.init(mp3defaultConfig);
}

function record(inputBuffer) {
    recBuffersL.push(inputBuffer[0]);
    recLength += inputBuffer[0].length;
    
    if (recordAsMP3) {
        
        var chunk = mp3Encoder.encode(inputBuffer[0]);

        if (chunk.length > 0) {
            recBufferMP3.push(chunk);
        }
    }
}

function exportMP3() {
    var mp3Blob;
    
    if (recordAsMP3) {
        mp3Blob = mp3Encoder.getMP3();
    } else {
        var bufferL = mergeBuffers(recBuffersL, recLength);
        mp3Blob = mp3Encoder.toFile(bufferL, mp3defaultConfig);
    }
    this.postMessage(mp3Blob);
}

function getBuffer() {
    var buffers = [];
    buffers.push(mergeBuffers(recBuffersL, recLength));
    buffers.push(mergeBuffers(recBuffersR, recLength));
    this.postMessage(buffers);
}

function clear() {
    recLength = 0;
    recBuffersL = [];
    recBuffersR = [];
    recBufferMP3 = [];
}

function mergeBuffers(recBuffers, recLength) {
    var result = new Float32Array(recLength);
    var offset = 0;
    for (var i = 0; i < recBuffers.length; i++) {
        result.set(recBuffers[i], offset);
        offset += recBuffers[i].length;
    }
    return result;
}

var MP3Encoder = function (config) {

    config = config || {};
    var libLamePath = config.mp3LibPath || 'lame.all.js';
    importScripts(libLamePath);

    var lib = new lamejs();

    var mp3encoder;

    function init(config) {
       // mp3encoder = new lib.Mp3Encoder(config.cannels || 1, config.sampleRate || 44100, config.bitRate || 128); 
        mp3encoder = new lib.Mp3Encoder(1, 44100, 64); 
    }

    function encode(buffer) {

        var input = float32ToInt(buffer);

        var output = mp3encoder.encodeBuffer(input);

        return output;
    }

    function float32ToInt(f32) {

        var len = f32.length
            , i = 0;
        var i16 = new Int16Array(len);

        while (i < len)
            i16[i] = convert(f32[i++]);

        function convert(n) {
            var v = n < 0 ? n * 32768 : n * 32767; 
            return Math.max(-32768, Math.min(32768, v));
        }

        return i16;

    }

    function finish() {
        return mp3encoder.flush();
    }

    function flush() {
        return mp3encoder.flush();
    }

    function toFile(buffer, config) {

        init(config);

        var mp3data = [encode(buffer)];

        mp3data.push(finish());

        var mp3Blob = new Blob(mp3data, {
            type: 'audio/mp3'
        });

        return mp3Blob;
    }

    function getMP3() {
        var mp3Blob = new Blob(recBufferMP3, {
            type: 'audio/mp3'
        });
        return mp3Blob;
    }

    this.init = init;
    this.encode = encode;
    this.toFile = toFile;
    this.getMP3 = getMP3;
    this.flush = flush;
};