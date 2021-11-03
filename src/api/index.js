// Branislav Hozza
import {Router} from 'express';
import auth from './auth.js';
import game from './game.js';

export default (games) => {
  // eslint-disable-next-line new-cap
  const api = Router();
  auth(api);
  game(api, games);
  return api;
};
