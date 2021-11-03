import express from 'express';
import {WebSocketServer} from 'ws';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();
import DB_CONFIG from './src/config/db.config.js';
import router from './src/api/index.js';
import {startGame} from './src/gameLogic/game.js';


const {
  NODE_DOCKER_PORT=8080,
  NODE_DOCKER_WS_PORT=8082,
} = process.env;
const gameCount = 1;
const games = [];

const app = express();


console.log('Starting server...');
await mongoose.connect(DB_CONFIG.url);
app.use('/favicon.ico', express.static('./static/favicon.ico'));
app.use('/', express.static('static'));


app.use(cors());

app.use(express.json());

app.use('/api', router(games));

app.listen(NODE_DOCKER_PORT, () => {
  console.log(`Server is running on  http://localhost:${NODE_DOCKER_PORT}`);
});


const socket = new WebSocketServer({port: NODE_DOCKER_WS_PORT});

socket.on('connection', (ws) => {
  ws.on('message', (raw) => {
    const {path, data} = JSON.parse(raw);
    if (path === 'init') {
      startGame(games, data, ws, gameCount);
    }
  });

  ws.on('error', function(event) {
    console.log('WebSocket error: ', event);
  });
  console.log(`Connected WS to server http://localhost:${NODE_DOCKER_WS_PORT}`);
});
