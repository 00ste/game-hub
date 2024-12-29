


let turn_id = 0;

const NO_TILE = -1;
let tiles = [
    NO_TILE, NO_TILE, NO_TILE,
    NO_TILE, NO_TILE, NO_TILE,
    NO_TILE, NO_TILE, NO_TILE
];
const win_lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],

    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],

    [0, 4, 8],
    [2, 4, 6]
];

const [GAME_WIN, GAME_LOSE, GAME_DRAW, GAME_ON] = [0, 1, 2, 3];

function check_game_state(tiles, turn) {
    for (const line of win_lines) {
        if ((tiles[line[0]] == tiles[line[1]])
         && (tiles[line[1]] == tiles[line[2]])) {
            console.log('line ' + line + ' was completed by ' + line[0]);
            if (tiles[line[0]] == turn) return {"state": GAME_WIN, "line": line};
            if (tiles[line[0]] == 1-turn) return {"state": GAME_LOSE, "line": line};
        }
    }
    for (const tile of tiles) {
        if (tile == NO_TILE) return {"state": GAME_ON};
    }
    return {"state": GAME_DRAW};
}

function do_move(user, position) {
    // check if it's the user's turn
    if (user != turn_id) return;

    // check if the clicked tile was free
    if (tiles[position] != NO_TILE) return;

    // mark the tile
    tiles[position] = user;

    /*
    // broadcast the update
    socket.broadcast.emit("board update", msg);
    socket.emit("board update", msg);
    */

    // check game state
    const state = check_game_state(tiles, turn_id);
    switch (state.state) {
        case GAME_WIN:
            console.log("game won! on line " + state.line);
            /*
            socket.broadcast.emit("user lose", {"line": state.line});
            socket.emit("user win", {"line": state.line});
            */
            turn_id = -1;
            break;
        case GAME_LOSE:
            console.log("game lost! on line " + state.line);
            /*
            socket.broadcast.emit("user win", {"line": state.line});
            socket.emit("user lose", {"line": state.line});
            */
            turn_id = -1;
            break;
        case GAME_DRAW:
            console.log("game draw!");
            /*
            socket.broadcast.emit("user draw", 0);
            socket.emit("user draw", 0);
            */
            turn_id = -1;
            break;
        case GAME_ON:
            console.log("game still not over!");
            // turn_id = (turn_id + 1) % 2;
            break;
    }

    turn_id = (turn_id + 1) % 2;
}
