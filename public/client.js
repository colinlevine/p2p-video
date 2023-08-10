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
        call.answer(stream)
        const video = document.createElement("video");
        call.on('stream', userVideoStream => { 
            addVideo(video, userVideoStream)
        })
    });

    // User connects
    socket.on("user-connected", userID => {
        const call = myPeer.call(userID, stream);
        const video = document.createElement("video");
        call.on("stream", userVideoStream => {
            addVideo(video, userVideoStream);
        })
        call.on('close', () => {
            video.remove()
        })

        peers[userID] = call;
    });

    //User disconnects
    socket.on("user-disconnected", userID => {
        if (peers[userID]) {
            peers[userID].close();
        }
    })
    
});


function addVideo (myVideo, stream) {
    myVideo.srcObject = stream;
    myVideo.addEventListener('loadedmetadata', () => {
        myVideo.play();
    });
    videoGrid.append(myVideo);
}
