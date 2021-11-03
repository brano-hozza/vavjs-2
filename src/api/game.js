// Branislav Hozza
import {Router} from 'express';
import {resetGame} from '../gameLogic/game.js';
import {checkToken} from './middlewares.js';
// eslint-disable-next-line
const route = Router();
/**
 * @param {Router} app
 * @param {Array} games
 */
export default (app, games) => {
  app.use('/game', route);
  route.use(checkToken);
  route.post('/action', (req, res) => {
    const {action, playerName} = req.body;
    console.log(`${playerName} action: ${action}`);
    const game = games.find((game) => game.id === playerName);
    if (game) {
      if (action === 'RIGHT') {
        if (game.player.parts[3].x < 10) {
          game.player.parts.forEach((part) => {
            part.x += 1;
          });
        }
      } else if (action === 'LEFT') {
        if (game.player.parts[3].x > 1) {
          game.player.parts.forEach((part) => {
            part.x -= 1;
          });
        }
      } else if (action === 'FIRE') {
        game.missiles.push({
          x: game.player.parts[3].x,
          y: game.player.parts[3].y - 1,
        });
      } else {
        return res.status(400).send({message: 'Invalid direction'});
      }
      return res.status(200).send({message: 'ok'});
    }
    return res.status(400).send({message: 'Invalid game'});
  });
  route.get('/scoreboard', (req, res) => {
    const scoreboard = {
      element: 'ol',
      content: '',
      classes: ['scoreboard'],
      children: [],
    };
    games.forEach((game) => {
      scoreboard.children.push({
        element: 'li',
        content: `${game.name} - ${game.player.username}`,
        classes: ['scoreboard-item'],
        children: [
          {
            element: 'ul',
            content: '',
            classes: ['scoreboard-item-details'],
            children: [
              {
                element: 'li',
                content: '',
                classes: ['scoreboard-item-details-item'],
                children: [
                  {
                    element: 'span',
                    content: 'ID: ',
                    classes: ['scoreboard-item-details-item-label'],
                  },
                  {
                    element: 'span',
                    content: game.id,
                    classes: ['scoreboard-item-details-item-value'],
                  },
                ],
              },
              {
                element: 'li',
                content: '',
                classes: ['scoreboard-item-details-item'],
                children: [
                  {
                    element: 'span',
                    content: 'Top Score: ',
                    classes: ['scoreboard-item-details-item-label'],
                  },
                  {
                    element: 'span',
                    content: game.player.topScore,
                    classes: ['scoreboard-item-details-item-value'],
                  },
                ],
              },
              {
                element: 'li',
                content: '',
                classes: ['scoreboard-item-details-item'],
                children: [
                  {
                    element: 'span',
                    content: 'Level: ',
                    classes: ['scoreboard-item-details-item-label'],
                  },
                  {
                    element: 'span',
                    content: game.level,
                    classes: ['scoreboard-item-details-item-value'],
                  },
                ],
              },
            ],
          },
        ],
      });
    });
    return res.status(200).send(scoreboard);
  });
  route.get('/reset', (req, res)=> {
    const {playerName} = req.body;
    console.log('Reseting...');
    const game = games.find((game) => game.id === playerName);
    if (game) {
      resetGame(game);
      return res.status(200).send({
        message: 'ok',
      });
    }
    res.status(404).send({
      message: 'Game doesnt exists',
    });
  });
};
