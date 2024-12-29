import express from 'express';
import session from "express-session";
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'pug');
const server = createServer(app);
const io = new Server(server);

const sessionMiddleware = session({
    secret: "changeit",
    resave: true,
    saveUninitialized: true,
});

app.use(sessionMiddleware);
io.engine.use(sessionMiddleware);



// SERVER DATA

/**
 * users: stores information about all the users currently active.
 * Maps user_id to the room_id of the room the user is connected to.
 */
let users = new Map();

/**
 * rooms: stores information about all the currently active rooms.
 * Maps room_id to:
 * - game_id:  The id of the game that is being played in the room.
 * - capacity: Capacity of the room (the maximum number of players that the room can hold).
 * - status:   The status of room, can be either WAITING or GAME.
 * - users:    The list of users, associated with their username, that are connected to the room.
 * - sockets:  The list of sockets which represent the current connections between each user and the room.
 */
const WAITING = 0
const PLAYING = 1
let rooms = new Map();
const MAIN_HUB_ROOM_ID = "00000";
rooms.set(MAIN_HUB_ROOM_ID, {
    game_id: "hub",
    capacity: 1000,
    status:   WAITING,
    users:    [],
    sockets:  [],
});

/**
 * games: stores information about all the currently playable games.
 * Stores objects with the following fields:
 * - id:          The id of the game.
 * - name:        The name of the game.
 * - description: A short description of the game.
 */
let games = [
    {
        id: "hub",
        name: "Hub",
        description: "The hub of the server, from where all games can be played!"
    },
    {
        id: "ttt",
        name: "Tic-Tac-Toe",
        description: "A simple game of Tic-Tac-Toe. Align three symbols horizontally, vertically or diagonally to win!"
    }
]



function user_set_room(user_id, room_id) {
    if (!rooms.has(room_id)) {
        console.error(`Failed to add user ${user_id} to room ${room_id}: Room does not exist`);
        return;
    }

    rooms.get(room_id).users.push(user_id);
    users.set(user_id, room_id);
}



// HTTP REQUEST HANDLERS

app.get('/', (req, res) => {
    // When a user connects to the / endpoint, get their user id from the session.
    let user_id = req.session.id;
    console.log(`${user_id} requested endpoint /`);

    // If they are not in the hub room, add them
    user_set_room(user_id, MAIN_HUB_ROOM_ID);
    res.render('hub');
});

app.get('/create_room', (req, res) => {
    res.render('create_room', { games_list: games.filter(x => x.id != "hub") });
});

app.get('/room_:room_id', (req, res) => {
    // Make sure the code exists.
    let room_id = req.params['room_id'];
    let user_id = req.session.id;
    let room = rooms.get(room_id);
    if (
        room == undefined || !room.waiting
        || room.users.length >= room.capacity
    ) {
        // For now, redirect back to the hub.
        // TODO: Possibly redirect to a "error" page, with a link to the hub.
        res.redirect('/');
    }

    // Add user to the waiting room before providing the html page.
    // This is important because the socket connection handler needs to know
    // which users belong to a room when a socket is created, so that only those
    // sockets are associated with a room and thus responses can be broadcasted
    // only to those sockets.
    user_set_room(user_id, room_id);

    res.render('room', { room: room });
});

app.get('game_:room_id', (req, res) => {
    // Add user to room before providing the html page.
    // This is important because the socket connection handler needs to know
    // which users belong to a room when a socket is created, so that only those
    // sockets are associated with a room and thus the responses can be broadcasted
    // only to those sockets.


    // Provide the correct html page based on the game: each game has a different
    // html page.
});



// SOCKET HANDLERS

// connection handler
io.on('connection', (socket) => {
    // user init
    let user_id = socket.request.session.id
    console.log(`${user_id} connected to socket      ${socket.id}`);

    // handlers defined after extablishing a connection
    // disconnect handler
    socket.on('disconnect', () => {
        console.log(`${user_id} disconnected from socket ${socket.id}`);
    });
});

server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
});