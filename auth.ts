import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';

import { User } from './users';
import { apiConfig } from './api-config';
import * as fs from 'fs';

export const handleAuthentication = (req: Request, resp: Response) => {
  const { email, password } = req.body;
  const user = getUser(email, password);
  if (user) {
    const _user = { id: user.id,  name: user.name, email: user.email, role: user.role }
    const token = jwt.sign({ payload: _user, iss: 'tqi-api' }, apiConfig.secret, { expiresIn: '15min' });
    resp.json({ accessToken: token });
  } else {
    resp.status(403).json({ message: 'Dados inválidos' });
  }
};

function getUser(email: string, password: string): User {
  const dbUser = JSON.parse(fs.readFileSync('./db.json', { encoding: 'utf8' })).users;
  return dbUser.find((user) => user.email === email && user.password === password);
}
