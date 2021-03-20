import * as jsonServer from 'json-server';
import * as fs from 'fs';
import * as https from 'https';
import * as dotenv from 'dotenv';
import { handleAuthentication } from './auth';
import { handleAuthorization } from './authz';
import JWTService from './jwt';
import { sendNotification } from './sendNotification';

dotenv.config();



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
server.use('/subscriptions');

server.post('/send-notification', sendNotification);

server.post('/refresh-token', function (req, res) {
  const refreshToken = req.body.refreshToken;

  if (!refreshToken) {
    return res.status(403).send('Acesso negado.');
  }

  try {
    const newTokens = JWTService.refreshToken(refreshToken);

    res.send(newTokens);
  } catch (err) {
    const message = (err && err.message) || err;
    res.status(403).send(message);
  }
});

server.use(router);


const options = {
  cert: fs.readFileSync('./keys/cert.pem'),
  key: fs.readFileSync('./keys/key.pem'),
};

if(process.env.PORT) {
  server.listen(process.env.PORT);
} else {
  https.createServer(options, server).listen(3333, '192.168.100.18', () => {
    console.log(`Server running at https://192.168.100.18:3333/`);
  });
}

