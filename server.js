const express = require("express");
const { allowedNodeEnvironmentFlags } = require("process");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { v4 } = require("uuid")
const port = process.env.PORT || 3000;
var allRooms = [];
var publicID = null;



app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get("/", (req, res) => {
    res.redirect(`/${v4()}`) // Creates room id
});

app.get("/:room", (req, res) => {
    res.render('room', { roomID: req.params.room, allRooms})
});

io.on('connection', socket => {
    socket.on('join-room', (roomID, userID) => {
        publicID = roomID;

        // Prevents duplicate rooms
        var x = allRooms.indexOf(roomID);
        if (x >= 0) {   
            // console.log("Room exists");
        }
        else {
            allRooms.push(roomID); // Adds room id to list of open rooms
        }
        console.log("Rooms: " + allRooms);

        
        socket.join(roomID);
        socket.to(roomID).emit("user-connected", userID);

        socket.on("disconnect", (req, res) => {
            socket.to(roomID).emit("user-disconnected", userID);
            // Removes room id from list when a user disconnects
            const index = allRooms.indexOf(roomID)
            allRooms.splice(index, 1);
            console.log("Rooms: " + allRooms);
        });
    })
    
});

// Form to join a room from room id
app.use(express.urlencoded({ extended: true }));
app.post("/join", (req, res) => {
    var newRoomID = req.body["updateRoom"];
    res.redirect("/" + newRoomID);
});


server.listen(port, () => {
    console.log(`Listening on port ${port}.`)
});