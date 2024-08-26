const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

let waitingPlayer = null;

let games = [];

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("INIT_GAME", () => {
    if (waitingPlayer) {
      // Start a new game
      const game = {
        player1: waitingPlayer,
        player2: socket.id,
        board: [
          ["A-P1", "A-P2", "A-H1", "A-H2", "A-P3"],
          ["", "", "", "", ""],
          ["", "", "", "", ""],
          ["", "", "", "", ""],
          ["B-P1", "B-P2", "B-H1", "B-H2", "B-P3"],
        ],
        movesHistory: [],
        startTime: new Date(),
        currentTurn: waitingPlayer,
      };

      games.push(game); // Notify both players that the game has started
      io.to(waitingPlayer).emit("game_started", { game, player: "player1" });
      socket.emit("game_started", { game, player: "player2" }); // Clear the waiting player

      waitingPlayer = null;
    } else {
      // If no player is waiting, set this player as the waiting player
      waitingPlayer = socket.id;
    }
  });

  socket.on("make_move", (data) => {
    const { selectedPiece, position, board } = data; 
    //TODO:Implement validation logic here 
    
    
    // Assuming valid move:
    const updatedBoard = [...board]; 
    
    // Update the board based on the selected piece and position
    updatedBoard[position[0]][position[1]] =
      updatedBoard[selectedPiece[0]][selectedPiece[1]];
    updatedBoard[selectedPiece[0]][selectedPiece[1]] = ""; 
    
    // Broadcast the updated board to all connected clients
    io.sockets.emit("updated_board", { updatedBoard });
  });
});

server.listen(3005, () => {
  console.log("SERVER IS RUNNING");
});
