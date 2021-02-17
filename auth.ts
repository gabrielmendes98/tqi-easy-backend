import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';

import { User } from './models';
import { apiConfig } from './api-config';
import * as fs from 'fs';

export const handleAuthentication = (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = getUser(email, password);
  if (user) {
    delete user.password;
    const accessToken = jwt.sign({ payload: user, iss: 'tqi-api' }, apiConfig.secret, { expiresIn: '1min' });
    const refreshToken = jwt.sign({ payload: user, iss: 'tqi-api'}, apiConfig.secret, { expiresIn: '30d' });
    res.json({ accessToken, refreshToken });
  } else {
    res.status(403).json({ message: 'Dados inválidos' });
  }
};

function getUser(email: string, password: string): User {
  const dbUser = JSON.parse(fs.readFileSync('./db.json', { encoding: 'utf8' })).users;
  return dbUser.find((user) => user.email === email && user.password === password);
}
