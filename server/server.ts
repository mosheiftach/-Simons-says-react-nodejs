import express, { Request, Response } from "express";
import bodyParser from "body-parser";

const app = express();
const port = 5000;
app.use(bodyParser.json());

interface GameData {
  currentRound: number;
  playerScore: number;
  computerSequence: number[];
  highScore: number;
}

let gameData: GameData = {
  currentRound: 0,
  playerScore: 0,
  computerSequence: [],
  highScore: 0,
};

app.get("/api/game", (req: Request, res: Response) => {
    gameData.computerSequence=[];
    gameData.currentRound=0;
    gameData.playerScore=0;
  res.json(gameData);
});

app.get("/api/computer-sequence", (req: Request, res: Response) => {
  const newButton = Math.floor(Math.random() * 4);
  gameData.computerSequence.push(newButton);
  res.json(gameData.computerSequence);
});

app.post("/api/reset-game", (req: Request, res: Response) => {
    gameData.playerScore = 0;
    gameData.currentRound = 0;
    gameData.computerSequence = [];
    gameData.highScore=req.body.highScore;
  
  res.json({ success: true });
});

app.post("/api/save-high", (req: Request, res: Response) => {
    gameData.highScore=req.body.highScore;
  res.json({ success: true });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
