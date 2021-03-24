import { User, Token } from './models';
import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';
import axios from 'axios';
import * as https from 'https';

const jwtSecretString = 'tqi-api-password';

const api = axios.create({
  httpsAgent: new https.Agent({  
    rejectUnauthorized: false
  }),
  baseURL: process.env.BASE_URL
});

class JWTService {
  getAccessToken(user: User) {
    delete user.password;
    return jwt.sign({ payload: user, iss: 'tqi-api' }, jwtSecretString, { expiresIn: '15min' });
  }

  getRefreshToken(user: User) {
    delete user.password;
    // get all user's refresh tokens from DB
    let tokens: Token[] = JSON.parse(fs.readFileSync('./db.json', { encoding: 'utf8' })).tokens;
    const userRefreshTokens = tokens.filter(token => token.userId == user.id);
  
    // check if there are 5 or more refresh tokens,
    // which have already been generated. In this case we should
    // remove all this refresh tokens and leave only new one for security reason
    if (userRefreshTokens.length >= 5) {
      tokens = tokens.filter(token => token.userId !== user.id);
      fs.writeFileSync('./db.json', JSON.stringify(tokens, null, 2), { encoding: 'utf-8' });
    }
  
    const refreshToken = jwt.sign({ payload: user, iss: 'tqi-api'}, jwtSecretString, { expiresIn: '30d' });
  
    api.post('/tokens', { userId: user.id, refreshToken });
  
    return refreshToken;
  }

  refreshToken(token: string) {
    // get decoded data
    const decodedToken: any = jwt.verify(token, jwtSecretString);
    console.log(decodedToken)
    // find the user in the user table
    const db = JSON.parse(fs.readFileSync('./db.json', { encoding: 'utf8' }));
    const user = db.users.find(user => user.id === decodedToken.payload.id);
  
    if (!user) {
      throw new Error('Acesso negado.');
    }
  
    // get all user's refresh tokens from DB
    const allRefreshTokens = db.tokens.filter(refreshToken => refreshToken.userId === user.id);
  
    if (!allRefreshTokens || !allRefreshTokens.length) {
      throw new Error('Esse usuário não pussui refresh tokens.');
    }
  
    const currentRefreshToken = allRefreshTokens.find(refreshToken => refreshToken.refreshToken === token);
  
    if (!currentRefreshToken) {
      throw new Error('Refresh token inválido.');
    }

    // get new refresh and access token
    const newRefreshToken = this.getUpdatedRefreshToken(currentRefreshToken, user);
    const newAccessToken = this.getAccessToken(user);
  
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }
  
  private getUpdatedRefreshToken(oldRefreshToken, user: User) {
    delete user.password;
    // create new refresh token
    const newRefreshToken = jwt.sign({ payload: user }, jwtSecretString, { expiresIn: '30d' });
    // replace current refresh token with new one
    api.patch('/tokens/' + oldRefreshToken.id, { refreshToken: newRefreshToken });
  
    return newRefreshToken;
  }
}

export default new JWTService();
