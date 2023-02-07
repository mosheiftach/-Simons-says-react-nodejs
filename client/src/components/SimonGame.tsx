import React, { useState, useEffect } from "react";
import "./SimonGame.scss";
import ColorCard from "./ColorCard";
import timeout from "../utils/utils";

interface PlayState {
  isDisplay: boolean;
  colors: string[];
  score: number;
  userPlay: boolean;
  userColors: string[];
  highScore: number;
}

const SimonGame: React.FC = () => {
  const [isOn, setIsOn] = useState(false);

  //Color list
  const colorList = ["green", "red", "yellow", "blue"];

  //Game states
  const initPlay: PlayState = {
    isDisplay: false,
    colors: [],
    score: 0,
    userPlay: false,
    userColors: [],
    highScore: 0,
  };

  //Setting states hooks
  const [play, setPlay] = useState(initPlay);
  const [flashColor, setFlashColor] = useState("");

  function startHandle() {
    setIsOn(true);
  }

  //Calling to API for initializing the game.
  useEffect(() => {
    if (isOn) {
      fetch("/api/game")
        .then((res) => res.json())
        .then((data) => {
          setPlay({ ...initPlay, isDisplay: true, highScore: data.highScore });
        });
    } else {
      setPlay(initPlay);
    }
  }, [isOn]);

  //API call for getting a sequence of actions (changing it to colors array)
  useEffect(() => {
    if (isOn && play.isDisplay) {
      fetch("/api/computer-sequence")
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          let newColor;
          let copyColors = [];
          for (let i = 0; i < data.length; i++) {
            newColor = colorList[data[i]];
            copyColors.push(newColor);
          }
          console.log(copyColors);
          setPlay({ ...play, colors: copyColors });
        });
    }
  }, [isOn, play.isDisplay]);

  //Calling displayColors in order to show the sequence of the computer
  useEffect(() => {
    if (isOn && play.isDisplay && play.colors.length) {
      displayColors();
    }
  }, [isOn, play.isDisplay, play.colors.length]);

  async function displayColors() {
    await timeout(600);
    for (let i = 0; i < play.colors.length; i++) {
      setFlashColor(play.colors[i]);
      await timeout(600);
      setFlashColor("");
      await timeout(600);

      if (i === play.colors.length - 1) {
        const copyColors = [...play.colors];

        setPlay({
          ...play,
          isDisplay: false,
          userPlay: true,
          userColors: copyColors.reverse(),
        });
      }
    }
  }

  //Click handler with indication of good guess or not.
  async function cardClickHandle(color: string) {
    if (!play.isDisplay && play.userPlay) {
      const copyUserColors = [...play.userColors];
      const lastColor = copyUserColors.pop();
      setFlashColor(color);
      if (color === lastColor) {
        if (copyUserColors.length) {
          setPlay({ ...play, userColors: copyUserColors });
        } else {
          await timeout(600);
          setPlay({
            ...play,
            isDisplay: true,
            userPlay: false,
            score: play.colors.length,
            userColors: [],
            highScore:
              play.highScore > play.colors.length
                ? play.highScore
                : play.colors.length,
          });
          submitHighScore();
        }
      } else {
        await timeout(600);
        submitResetGame();
      }
      await timeout(200);
      setFlashColor("");
    }
  }

  //API function to post the server that the game is ended.
  async function submitResetGame() {
    const response = await fetch("/api/reset-game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ highScore: play.highScore }),
    });
    const data = await response.json();
    if (data.success) {
      // Update the state or perform other actions
      setPlay({
        ...initPlay,
        score: play.colors.length,
        highScore: play.highScore,
      });
    }
  }

  async function submitHighScore() {
    await fetch("/api/save-high", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ highScore: play.colors.length }),
    });
  }

  function closeHandle() {
    setIsOn(false);
  }

  return (
    <div className="simon-game">
      <h1>
        {play.highScore > 0 ? `High score: ${play.highScore}` : "Lets Play"}
      </h1>
      <header className="simon-game-header">
        <div className="cardWrapper">
          {colorList &&
            colorList.map((v, i) => (
              <ColorCard
                onClick={() => {
                  cardClickHandle(v);
                }}
                flash={flashColor === v}
                color={v}
                key={i}
              ></ColorCard>
            ))}
        </div>

        {isOn && !play.isDisplay && !play.userPlay && play.score && (
          <div className="lost">
            <div>
              FinalScore: {play.score - 1}
              <br />
              HighScore: {play.highScore}
            </div>
            <button className="closeButton" onClick={closeHandle}>
              Close
            </button>
          </div>
        )}
        {!isOn && !play.score && (
          <button onClick={startHandle} className="startButton">
            Start
          </button>
        )}
        {isOn && (play.isDisplay || play.userPlay) && (
          <div className="score">{play.score}</div>
        )}
      </header>
    </div>
  );
};

export default SimonGame;
