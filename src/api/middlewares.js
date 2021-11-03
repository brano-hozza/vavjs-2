// Branislav Hozza
import jwt from 'jsonwebtoken';

export const checkToken = (req, res, next) => {
  if (req.method === 'OPTIONS') return next();
  const token = req.headers['authorization'].split(' ')[1];
  if (!token) {
    return res.status(401).send({message: 'No token provided.'});
  }
  jwt.verify(token, process.env.HASH_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(500).send({message: 'Failed to authenticate token.'});
    }
    req.body.playerName = decoded.username;
    return next();
  });
};
