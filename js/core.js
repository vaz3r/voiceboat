var audio_context;
var recorder;
var recording = 0;

var timeVal = 0;
var time_enabled = false;

String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10);
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours < 10) {
        hours = "0" + hours;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    return minutes + ':' + seconds;
}

function recordTime() {
    if (time_enabled == true) {
        var time_span = document.getElementById('time');
        timeVal += 1;

        time_span.innerHTML = timeVal.toString().toHHMMSS();
    }
}

function startRecording(button) {
    timeVal = 0;
    recording = recording + 1;
    recorder.clear();

    recorder && recorder.record();
}

function stopRecording(button) {
    recorder && recorder.stop();

    createDownloadLink();
}

function checkDuration() {
    if (audio.currentTime >= audio.duration) {
        pause_button.style.display = "none";
        play_button.style.display = "block";
        buttonState = "play";
    }
}

function play_pause_handler() {
    if (buttonState == "play") {
        play_button_onClick();
    } else {
        if (buttonState == "pause") {
            pause_button_onClick();
            buttonState = "play";
        }
    }
}

function pause_button_onClick() {
    pause_button.style.display = "none";
    play_button.style.display = "block";

    audio.pause();
}

function play_button_onClick() {
    pause_button.style.display = "block";
    play_button.style.display = "none";

    audio.play();

    setInterval(checkDuration, 500);
    buttonState = "pause";
}

function deleteRecording() {
    location.reload();
}

function createDownloadLink() {
    recorder.exportMP3(function (blob) {
        var url = URL.createObjectURL(blob);

        audio = new Audio(url);

        play_button.style.display = "block";

        play_button.onclick = play_button_onClick;
        pause_button.onclick = pause_button_onClick;

        is_On = false;
        grey_circle.style.stroke = "#c3c3c3";
        color = "#c3c3c3";
        grey_circle.style.opacity = "0.5";
        time_text.innerHTML = "";
        time_text.setAttribute("transform", "matrix(1 0 0 1 435.3716 408.2805)");
        send_button.style.display = "block";
        normal_grey_circle1.style.display = "block";
        normal_circle1.style.display = "block";
        normal_grey_circle2.style.display = "block";
        normal_circle2.style.display = "block";
        grey_circle.style.display = "block";
        play_button.style.display = "block";
        delete_button.style.display = "block";
        recordButton.style.fill = "#3399cc";

        recordButton.onmouseover = function () {
            recordButton.style.fill = "#308fbe";
        };
        recordButton.onmouseout = function () {
            recordButton.style.fill = "#3399cc";
        };

        normal_circle1.onclick = deleteRecording;
        delete_button.onclick = deleteRecording;
        send_button.onclick = uploadBlob(blob);
    });
}

function uploadBlob(blob) {
    var fd = new FormData();
    fd.append('file', blob);
    $.ajax({
        type: 'POST'
        , url: 'https://vazer.pythonanywhere.com/upload_file/'
        , data: fd
        , processData: false
        , contentType: false
    }).done(function (data) {
        console.log(data);
    });
}

var color = "#db2c32";
var is_On = false;
var grey_circle;

function regProgress() {
    if (is_On == true) {
        grey_circle.style.opacity = "1";

        if (color == "#db2c32") {
            grey_circle.style.stroke = "#c3c3c3";
            color = "#c3c3c3";
            grey_circle.style.opacity = "0.5";
        } else {
            grey_circle.style.stroke = "#db2c32";
            color = "#db2c32";
        }

        setTimeout(regProgress, 500);
    }
}

var recButton_Active = true;
var buttonState = "play";

var audio;
var recordButton;
var stopButton;
var time_text;
var record_microphone;
var send_button;
var normal_grey_circle1;
var normal_grey_circle2;
var normal_circle1;
var normal_circle2;
var play_button;
var delete_button;
var pause_button;

function init() {
    audioRecorder.requestDevice(function (recorderObject) {
        recorder = recorderObject;
    }, {
        recordAsOGG: false
    });

    recordButton = document.getElementById("red_circle");
    stopButton = document.getElementById("red_rectangle");
    time_text = document.getElementById("time");
    record_microphone = document.getElementById("record_microphone");

    send_button = document.getElementById("send_button");
    pause_button = document.getElementById("pause_button");
    normal_grey_circle1 = document.getElementById('normal_grey_circle1');
    normal_circle1 = document.getElementById('normal_circle1');
    normal_grey_circle2 = document.getElementById('normal_grey_circle2');
    normal_circle2 = document.getElementById('normal_circle2');
    grey_circle = document.getElementById('grey_circle');
    play_button = document.getElementById('play_button');
    delete_button = document.getElementById('delete_button');

    normal_circle2.onclick = play_pause_handler;

    recordButton.onclick = function () {
        if (recButton_Active == true) {
            recordButton.style.display = 'none';
            stopButton.style.display = 'block';
            time_text.style.display = 'block';

            startRecording(this);
        }
    };

    stopButton.onclick = function () {
        record_microphone.style.display = "none";
        time_text.innerHTML = "Saving";
        time_text.setAttribute("transform", "matrix(1 0 0 1 425.3716 408.2805)");
        is_On = true;

        recButton_Active = false;

        setTimeout(regProgress, 500);

        recordButton.style.display = 'block';
        stopButton.style.display = 'none';

        stopRecording(this);
    };
}

window.onload = init;