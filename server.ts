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
server.use('/alura-accesses', handleAuthorization);

server.use(router);

const options = {
  cert: fs.readFileSync('./keys/cert.pem'),
  key: fs.readFileSync('./keys/key.pem'),
};

https.createServer(options, server).listen(3333, () => {
  console.log('JSON Server running on https://localhost:3333');
});
