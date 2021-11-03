// Branislav Hozza
import {Router} from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserModel from '../models/user.model.js';
// eslint-disable-next-line
const route = Router();
/**
 * @param {Router} app
 */
export default (app) => {
  app.use('/auth', route);
  route.post('/login', (req, res) => {
    const {username, password} = req.body;
    UserModel.findOne({username})
        .exec((err, user) => {
          if (err) {
            res.status(500).send({message: err});
            return;
          }

          if (!user) {
            res.status(404).send({message: 'User Not found.'});
            return;
          }

          const passwordIsValid = bcrypt.compareSync(
              password,
              user.password,
          );

          if (!passwordIsValid) {
            res.status(401).send({
              accessToken: null,
              message: 'Invalid Password!',
            });
            return;
          }
          const payload = {
            username,
          };

          const token = jwt.sign(
              payload,
              process.env.HASH_TOKEN, {
                expiresIn: 10000,
              },
          );
          res.status(200).send({
            token,
            username: user.username,
          });
        });
  });
  route.post('/register', async (req, res) => {
    const {
      username,
      password,
    } = req.body;
    try {
      let user = await UserModel.findOne({
        $or: [
          {username},
        ],
      });
      if (user) {
        return res.status(400).json({
          message: 'User Already Exists',
        });
      }

      user = new UserModel({
        username,
        password,
        admin: false,
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        username,
      };

      jwt.sign(
          payload,
          process.env.HASH_TOKEN, {
            expiresIn: 10000,
          },
          (err, token) => {
            if (err) throw err;
            res.status(200).json({
              token,
              username,
            });
          },
      );
    } catch (err) {
      console.log(err.message);
      res.status(500).send('Error in Saving');
    }
  });
};
