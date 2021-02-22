import { Request, Response } from 'express';
import * as fs from 'fs';

import { User } from './models';
import JWTService from './jwt';

export const handleAuthentication = (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = getUser(email, password);
  if (user) {
    const accessToken = JWTService.getAccessToken(user);
    const refreshToken = JWTService.getRefreshToken(user);
    res.json({ accessToken, refreshToken });
  } else {
    res.status(403).json({ message: 'Dados inválidos' });
  }
};

function getUser(email: string, password: string): User {
  const dbUser = JSON.parse(fs.readFileSync('./db.json', { encoding: 'utf8' })).users;
  return dbUser.find((user) => user.email === email && user.password === password);
}
