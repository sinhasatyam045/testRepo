// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
import "./ChessBoard.styles.css";
import io from "socket.io-client";

const socket = io.connect("http://localhost:3005");

const ChessBoard = () => {
  const initialBoard = [
    ["A-P1", "A-P2", "A-H1", "A-H2", "A-P3"],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["B-P1", "B-P2", "B-H1", "B-H2", "B-P3"],
  ];

  const [board, setBoard] = useState(initialBoard);
  const [selectedPiece, setSelectedPiece] = useState(null);

  useEffect(() => {
    const handleMove = (data) => {
      setBoard(data.updatedBoard); // Update board with received state
    };

    socket.on("updated_board", handleMove);

    return () => socket.off("updated_board", handleMove);
  }, [socket]);

  const isValidPawnMove = (piece, from, to, board) => {
    const isStartingPosition = from[0] === (piece[0] === "A" ? 1 : 6);
    const isForwardMovement = to[0] - from[0] === (piece[0] === "A" ? 1 : -1);

    if (isForwardMovement) {
      // Check for single space move
      if (Math.abs(to[1] - from[1]) === 0 && Math.abs(to[0] - from[0]) === 1) {
        return true;
      } else if (
        isStartingPosition &&
        Math.abs(to[0] - from[0]) === 2 &&
        board[to[0] - 1][to[1]] === ""
      ) {
        // Check for two-space move from starting position
        return true;
      }
    }

    return false;
  };

  const isValidH1Move = (piece, from, to) => {
    return Math.abs(to[0] - from[0]) <= 2 && Math.abs(to[1] - from[1]) <= 2;
  };

  const isValidH2Move = (piece, from, to) => {
    return Math.abs(to[0] - from[0]) === 2 && Math.abs(to[1] - from[1]) === 2;
  };

  const handleSquareClick = (row, col) => {
    if (selectedPiece) {
      const from = selectedPiece;
      const to = [row, col];
      const piece = board[from[0]][from[1]];

      if (piece.includes("P")) {
        if (isValidPawnMove(piece, from, to, board)) {
          socket.emit("make_move", { selectedPiece, position: to, board });
          setSelectedPiece(null);
        } else {
          alert("Invalid pawn move!");
        }
      } else if (piece.includes("H1")) {
        if (isValidH1Move(piece, from, to)) {
          socket.emit("make_move", { selectedPiece, position: to, board });
          setSelectedPiece(null);
        } else {
          alert("Invalid H1 move!");
        }
      } else if (piece.includes("H2")) {
        if (isValidH2Move(piece, from, to)) {
          socket.emit("make_move", { selectedPiece, position: to, board });
          setSelectedPiece(null);
        } else {
          alert("Invalid H2 move!");
        }
      }
    } else if (board[row][col] !== "") {
      setSelectedPiece([row, col]);
    }
  };

  return (
    <div className="chessboard">
      {board.map((row, rowIndex) =>
        row.map((piece, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            onClick={() => handleSquareClick(rowIndex, colIndex)}
            className={`square ${piece ? "bg-gray-500" : ""}`}
          >
            {piece}
          </div>
        ))
      )}
    </div>
  );
};

export default ChessBoard;
