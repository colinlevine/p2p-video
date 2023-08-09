const socket = io("/");

// peerjs
const myPeer = new Peer(undefined, {
    // host: "/",
    // port: "3001"
});

myPeer.on('open', clientUserID => {
    socket.emit("join-room", clientRoomID, clientUserID);
});


// Video
const videoGrid = document.querySelector("#video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;
const peers = {};


navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    // Add primary user video
    addVideo(myVideo, stream)

    // Add secondary
    myPeer.on('call', call => {
        call.answer(stream) // Adds second video to user 1
        const video = document.createElement("video");
        video.style.marginLeft = "2.5rem";
        call.on('stream', userVideoStream => { // Updates user 2 with user 1 video
            addVideo(video, userVideoStream)
        })
    });

    socket.on("user-connected", userID => {
        const call = myPeer.call(userID, stream);
        const video = document.createElement("video");
        video.style.marginLeft = "2.5rem";
        call.on("stream", userVideoStream => {
            addVideo(video, userVideoStream);
        })
        call.on('close', () => {
            video.remove()
        })

        peers[userID] = call;
    });

    socket.on("user-disconnected", userID => {
        if (peers[userID]) {
            peers[userID].close();
        }
    })

    
    
});

// Prevents page from refreshing
$(document).ready(function () {
    $("#publicR").click(function () {
       $.post("/publicRoom", () => {
          });
    });
 });
$(document).ready(function () {
    $("#privateR").click(function () {
       $.post("/privateRoom", () => {
          });
    });
 });

function addVideo (myVideo, stream) {
    myVideo.srcObject = stream;
    myVideo.addEventListener('loadedmetadata', () => {
        myVideo.play();
    });
    videoGrid.append(myVideo);
}

// socket.on("public-room", () => {
//     document.querySelector("#room-status").innerText = "Public Room";
// })
// socket.on("private-room", () => {
//     document.querySelector("#room-status").innerText = "Private Room";
// })
