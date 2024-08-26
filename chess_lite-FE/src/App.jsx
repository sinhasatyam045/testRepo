import { useState } from "react";
import "./App.css";
import ChessBoard from "./components/ChessBoard";
import io from "socket.io-client";
const socket = io.connect("http://localhost:3005");

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [waiting, setWaiting] = useState(false);

  const handlePlayClick = () => {
    socket.emit("INIT_GAME");
    setWaiting(true);
  };

  socket.on("game_started", (data) => {
    console.log(data);
    setWaiting(false);
    setGameStarted(true);
  });

  return (
    <div className="flex items-center justify-center min-h-screen">
      {!gameStarted ? (
        <>
          {waiting ? (
            <p>Waiting for others to join...</p>
          ) : (
            <button onClick={handlePlayClick} className="play-button">
              Play
            </button>
          )}
        </>
      ) : (
        <ChessBoard socket={socket} />
      )}
    </div>
  );
}

export default App;
