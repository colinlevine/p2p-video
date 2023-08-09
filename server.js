const express = require("express");
const { allowedNodeEnvironmentFlags } = require("process");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { v4 } = require("uuid")
const port = process.env.PORT || 3000;
var allRooms = [];
var publicRooms = [];
var publicID = null;



app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get("/", (req, res) => {
    console.log("Public rooms: " + publicRooms);
    res.redirect(`/${v4()}`) // creates room id
});

app.get("/:room", (req, res) => {
    res.render('room', { roomID: req.params.room, allRooms})
});

io.on('connection', socket => {
    socket.on('join-room', (roomID, userID) => {
        // console.log(roomID, userID);
        publicID = roomID;

        // prevents duplicate rooms
        var x = allRooms.indexOf(roomID);
        if (x >= 0) {   
            // console.log("Room exists");
        }
        else {
            allRooms.push(roomID); // Adds room id to list of open rooms
        }
        // console.log("All rooms: " + allRooms);

        
        console.log(allRooms);
        socket.join(roomID);
        socket.to(roomID).emit("user-connected", userID);

        socket.on("disconnect", (req, res) => {
            socket.to(roomID).emit("user-disconnected", userID);
            // Removes user id from list when a user disconnects
            const index = allRooms.indexOf(roomID)
            allRooms.splice(index, 1);
            const index2 = publicRooms.indexOf(roomID)
            publicRooms.splice(index2, 1);
            console.log(allRooms);
            // io.sockets.emit("private-room");
        });
    })
});

// Form to join a room from room id
app.use(express.urlencoded({ extended: true }));
app.post("/join", (req, res) => {
    var newRoomID = req.body["updateRoom"];
    res.redirect(newRoomID);
});

app.post("/publicRoom", (req,res) => {
    // prevents duplicate rooms
    var x = publicRooms.indexOf(publicID);
    if (x >= 0) {   
        // console.log("Room exists")
    }
    else {
        publicRooms.push(publicID);
        io.sockets.emit("public-room");
    }
    console.log("Public rooms: " + publicRooms);

    });

app.post("/privateRoom", (req,res) => {
    // prevents duplicate rooms
    var y = publicRooms.indexOf(publicID);
    if (y >= 0) {   
        publicRooms.splice(y, 1);
        io.sockets.emit("private-room");
    }

    console.log("Public rooms: " + publicRooms);
});

// Join a random room
app.post("/joinRandom", (req, res) => {
    publicRoomsIndex = Math.floor(Math.random() * publicRooms.length);
    var newRoomID = publicRooms[publicRoomsIndex];
    console.log("Public rooms: " + publicRooms);

    x = 0;
    while (x == 0) {
        if (newRoomID == publicID || newRoomID == null) {
            publicRoomsIndex = Math.floor(Math.random() * publicRooms.length);
            var newRoomID = publicRooms[publicRoomsIndex];
        }
        else {
            break;
        }
    }
    
    if (publicRooms.length == 0) {
        res.write("<p>No rooms found</p>");
        res.write("<a href='/'>Back to main page</a><br>");
        res.write('<link rel="stylesheet" href="style.css">');
        res.end();
    }
    else {
        res.redirect("/" + newRoomID);
    }

    console.log(allRooms);
});



server.listen(port, () => {
    console.log(`Listening on port ${port}.`)
});