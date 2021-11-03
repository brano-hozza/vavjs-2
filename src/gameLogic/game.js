import levels from './levels.js';
// Branislav Hozza
const nextLevel = (level) => {
  const arr = levels[level] ?? [];
  return arr.reduce((acc, old) => {
    const newCopy = {
      x: old.x,
      y: old.y,
    };
    acc.push(newCopy);
    return acc;
  }, []);
};

const checkCollisionsMA = ({missiles, enemies, player}) => {
  for (let i=0; i<missiles.length; i++) {
    if (enemies.some((alien) => alien.x === missiles[i].x && alien.y === missiles[i].y)) {
      const alienIndex = enemies.findIndex((alien) => alien.x === missiles[i].x && alien.y === missiles[i].y);
      enemies.splice(alienIndex, 1);
      missiles.splice(i, 1);
      player.score += 10;
      player.topScore = player.topScore > player.score? player.topScore : player.score;
    }
  }
};

const moveEnemy = (game, ws, games) => (() => {
  if (!game.online) {
    return;
  }
  if (game.didReset) {
    game.didReset = false;
    clearInterval(game.enemyInterval);
    game.enemyInterval = setInterval(moveEnemy(game, ws, games), 512);
  }
  try {
    if (game.enemies.length === 0) {
      game.level += 1;

      if (game.level > 4) {
        game.level = 0;
        game.speed = game.speed / 2;
        clearInterval(game.enemyInterval);
        game.enemyInterval = setInterval(moveEnemy(game, ws, games), game.speed);
      }
      game.enemies = nextLevel(game.level);
      console.log('Next level:', game.level);
    }
    game.lowerIndex++;
    if (game.lowerIndex % 4 === 3) {
      game.lowerIndex = 0;
      game.enemies.forEach((enemy) => {
        enemy.y += 1;
        if (enemy.y > 10) {
          game.lost = true;
          console.log(`Stoping game "${game.id}"... Reason: Lost at level ${game.level}` );
          game.enemies = nextLevel(0);
          game.speed = 512;
          game.online = false;
        }
      });
    }
    const globalTopScore = games
        .sort((g1, g2)=> g1.player.topScore - g2.player.topScore)[games.length - 1].player.topScore;
    // eslint-disable-next-line no-unused-vars
    const {playerInterval, enemyInterval, ...payload} = game;
    ws.send(JSON.stringify({path: 'render', data: {...payload, globalTopScore}}), (err) => {
      if (err) {
        throw err;
      }
    });
  } catch (e) {
    console.log(`Stoping game "${game.id}"... Reason: ${e}` );
    game.online = false;
    clearInterval(game.playerInterval);
    clearInterval(game.enemyInterval);
  }
});

const moveMissiles = ({missiles}) => {
  missiles.forEach((missile) => {
    missile.y -= 1;
    missiles = missiles.filter((m) => m.y > 0);
  });
};

const movePlayer = (game, ws, games) => (() => {
  if (!game.online) {
    return;
  }
  try {
    moveMissiles(game);
    checkCollisionsMA(game);
    const globalTopScore = games
        .sort((g1, g2)=> g1.player.topScore - g2.player.topScore)[games.length - 1].player.topScore;
    // eslint-disable-next-line no-unused-vars
    const {playerInterval, enemyInterval, ...payload} = game;
    ws.send(JSON.stringify({path: 'render', data: {...payload, globalTopScore}}), (err) => {
      if (err) {
        throw err;
      }
    });
  } catch (e) {
    console.log(`Stoping game "${game.id}"... Reason: ${e}` );
    game.online = false;
    clearInterval(game.playerInterval);
    clearInterval(game.enemyInterval);
  }
});

export const resetGame = (game) => {
  game.online = true;
  game.level = 0;
  game.lowerIndex = 0;
  game.lost = false;
  game.win = false;
  game.speed = 512;
  game.missiles = [];
  game.enemies = nextLevel(0);
  game.player.score = 0;
  game.didReset = true;
};

export const startGame = (games, data, ws, gameCount) => {
  const {playerName} = data;
  console.log(`${playerName} connected`);
  let game = games.find((g) => g.id === playerName);
  if (game) {
    console.log(`Game already exists... Game name: ${game.id}, Level: ${game.level}`);
  }
  if (!game) {
    console.log('Game wasnt found... creating');

    game = {
      id: playerName,
      name: 'Game ' + gameCount++,
      online: true,
      level: 0,
      lost: false,
      win: false,
      didReset: false,
      speed: 512,
      lowerIndex: 0,
      missiles: [],
      player: {
        username: playerName,
        score: 0,
        topScore: 0,
        parts: [
          {
            x: 4,
            y: 11,
          },
          {
            x: 5,
            y: 11,
          },
          {
            x: 6,
            y: 11,
          },
          {
            x: 5,
            y: 10,
          },

        ],
      },
      enemies: nextLevel(0),
    };
    games.push(game);
  }
  if (game.lost) {
    game.level = 0;
    game.enemies = nextLevel(0);
  }
  game.online = true;
  game.playerInterval = setInterval(movePlayer(game, ws, games), 100);
  game.enemyInterval = setInterval(moveEnemy(game, ws, games), game.speed);
};

