import { User, Token } from './models';
import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';

const jwtSecretString = 'tqi-api-password';

export class JWTService {
  getAccessToken(user: User) {
    return jwt.sign({ payload: user, iss: 'tqi-api' }, jwtSecretString, { expiresIn: '1min' });
  }

  getRefreshToken(user: User) {
    // get all user's refresh tokens from DB
    let tokens: Token[] = JSON.parse(fs.readFileSync('./db.json', { encoding: 'utf8' })).tokens;
    const userRefreshTokens = tokens.filter(token => token.userId === user.id);
  
    // check if there are 5 or more refresh tokens,
    // which have already been generated. In this case we should
    // remove all this refresh tokens and leave only new one for security reason
    if (userRefreshTokens.length >= 5) {
      tokens = tokens.filter(token => token.userId !== user.id);
      fs.writeFileSync('./db.json', JSON.stringify(tokens, null, 2), { encoding: 'utf-8' });
    }
  
    const refreshToken = jwt.sign({ payload: user, iss: 'tqi-api'}, jwtSecretString, { expiresIn: '30d' });
  
    // mockDB.tokens.push({
    //   id: uuidv1(),
    //   userId: user.id,
    //   refreshToken
    // });
  
    return refreshToken;
  }
  

}
