// Branislav Hozza


/**
   * class to represent User data
   * @return {UserData}
   */
class UserData {
  /**
     * UserData constructor
     * @param {User} user Object with user data
     */
  constructor(user) {
    this.username = user.username;
    this.token = user.token;
    this.APIdata = {};
  }
};

/**
   * Function to setup handle screen
   * @param {Node} app Root node for the app
   * @param {Object} appstate App state
   */
export default function setupGame(app, appstate) {
  document.addEventListener('keydown', function(e) {
    e.preventDefault();
    e.stopPropagation();
  });
  const userData = new UserData(appstate.user);
  // Login header
  const gameHeader = document.createElement('h2');
  gameHeader.innerText = 'Game';
  app.appendChild(gameHeader);

  const canvas = document.createElement('canvas');
  canvas.width = appstate.gameWidth;
  canvas.height = appstate.gameHeight;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, appstate.gameWidth, appstate.gameHeight);
  const resetButton = document.createElement('button');
  resetButton.innerHTML = 'RESET GAME';
  resetButton.addEventListener('click', ()=>{
    fetch('/api/game/reset', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userData.token}`,
      },
    }).then((response) => {
      if (response.status === 200) {
        return response.json();
      }
      throw new Error('Failed to fetch scoreboard');
    }).then((data) => {
      console.log('Resetting...');
    }).catch((err) => {
      console.log(err);
    });
  });

  /**
   * Function to draw the game
   * @param {Object} game Game data to draw
   */
  function render(game) {
    ctx.clearRect(0, 0, appstate.gameWidth, appstate.gameHeight);
    ctx.font = '15px Arial';
    ctx.fillStyle='white';
    ctx.fillText(`Score: ${game.player.score}`, (appstate.gameHeight/5) * 4, 15);
    ctx.fillText(`Your Top Score: ${game.player.topScore}`, (appstate.gameHeight/5) * 4, 30);
    ctx.fillText(`Global Top Score: ${game.globalTopScore}`, (appstate.gameHeight/5) * 4, 45);
    ctx.fillText(`Level: ${game.level}`, (appstate.gameHeight/5) * 4, 60);
    ctx.fillText(`Speed: ${game.speed}`, (appstate.gameHeight/5) * 4, 75);
    ctx.fillStyle = '#ffffff';
    game.enemies.forEach((alien) => {
      const transformX = (alien.x+appstate.xOffset) * appstate.fieldSize;
      const transformY = (alien.y+appstate.yOffset) * appstate.fieldSize;
      const ufoImage = new Image();
      /*
      Obrazok:
        Licencia CC
        Zdroj: https://openclipart.org
      */
      ufoImage.src = 'https://openclipart.org/download/270215/unimpressed-alien.svg';
      ufoImage.onload = function() {
        ctx.drawImage(ufoImage, transformX, transformY, appstate.fieldSize, appstate.fieldSize);
      };
    });
    game.player.parts.forEach((ship) => {
      const transformX = (ship.x+appstate.xOffset) * appstate.fieldSize;
      const transformY = (ship.y+appstate.yOffset) * appstate.fieldSize;
      const shipImage = new Image();
      /*
      Obrazok:
        Licencia CC
        Zdroj: https://cdn.pixabay.com
      */
      shipImage.src = 'https://cdn.pixabay.com/photo/2019/05/01/14/25/space-4171004_1280.png';
      shipImage.onload = function() {
        ctx.drawImage(shipImage, transformX, transformY, appstate.fieldSize, appstate.fieldSize);
      };
    });
    game.missiles.forEach((missile) => {
      const transformX = (missile.x+appstate.xOffset) * appstate.fieldSize;
      const transformY = (missile.y+appstate.yOffset) * appstate.fieldSize;
      const laserImage = new Image();
      /*
      Obrazok:
        Licencia CC
        Zdroj: https://cdn.pixabay.com
      */
      laserImage.src = 'https://cdn.pixabay.com/photo/2013/07/12/12/41/rocket-146109_1280.png';
      laserImage.onload = function() {
        ctx.drawImage(laserImage, transformX, transformY, appstate.fieldSize, appstate.fieldSize);
      };
    });
    if (game.lost) {
      ctx.font = '30px Arial';
      ctx.fillStyle='white';
      ctx.fillText('You lost', (appstate.gameHeight/2), (appstate.gameWidth/2));
    }
  }

  const ws = new WebSocket('ws://localhost:8082');

  /**
   * Create HTML elements from JSON
   * @param {RawNodeObject} data element from API
   * @return {NodeObject} HTML element
   */
  function recursiveCreateElement(data) {
    const el = document.createElement(data.element);
    el.innerText = data.content;
    el.className = data.classes.join(' ');
    if (!data.children) {
      return el;
    }
    data.children.forEach((child) => {
      el.appendChild(recursiveCreateElement(child));
    });
    return el;
  }
  /**
 * Initial function to test connection
 */
  function initial() {
    ws.send(JSON.stringify({
      path: 'init',
      data: {
        playerName: userData.username,
      },
    }));
    fetch('/api/game/scoreboard', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userData.token}`,
      },
    }).then((response) => {
      if (response.status === 200) {
        return response.json();
      }
      throw new Error('Failed to fetch scoreboard');
    }).then((data) => {
      app.appendChild(recursiveCreateElement(data));
    }).catch((err) => {
      console.log(err);
    });
  };

  ws.addEventListener('open', () =>{
    initial();
  });
  ws.addEventListener('message', ({data: raw})=>{
    const {path, data} = JSON.parse(raw);
    if (path === 'render') {
      render(data);
    }
  });


  app.appendChild(canvas);
  app.appendChild(resetButton);
  document.addEventListener('keydown', (e) => {
    let action = '';
    if (e.code === 'ArrowLeft') {
      action = 'LEFT';
    } else if (e.code === 'ArrowRight') {
      action = 'RIGHT';
    } else if (e.code === 'Space') {
      action = 'FIRE';
    } else {
      return;
    }
    fetch('http://localhost:8080/api/game/action', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userData.token}`,
      },
      body: JSON.stringify({
        action,
      }),
    }).then((raw) => {
      if (raw.status === 200) {
        return raw.json();
      }
      throw new Error(`Failed to to do action: ${action}`);
    }).catch((err) => {
      console.log(err);
    });
  });
}

