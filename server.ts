import * as jsonServer from 'json-server';
import * as fs from 'fs';
import * as https from 'https';

import { handleAuthentication } from './auth';
import { handleAuthorization } from './authz';

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);
server.use(jsonServer.bodyParser);

server.post('/login', handleAuthentication);
server.use('/dashboard-info', handleAuthorization);
server.use('/users', handleAuthorization);
server.use('/projects', handleAuthorization);
server.use('/activities', handleAuthorization);
server.use('/profile', handleAuthorization);
server.use('/announcements', handleAuthorization);
server.use('/comments', handleAuthorization);

// server.post('/refresh-token', function (req, res) {
//   const refreshToken = req.body.refreshToken;

//   if (!refreshToken) {
//     return res.status(403).send('Acesso negado.');
//   }

//   try {
//     const newTokens = jwtService.refreshToken(refreshToken, res);

//     res.send(newTokens);
//   } catch (err) {
//     const message = (err && err.message) || err;
//     res.status(403).send(message);
//   }
// });

server.use(router);

const options = {
  cert: fs.readFileSync('./keys/cert.pem'),
  key: fs.readFileSync('./keys/key.pem'),
};

https.createServer(options, server).listen(3333, () => {
  console.log('JSON Server running on https://localhost:3333');
});
