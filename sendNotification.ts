import * as fs from 'fs';
const webpush = require('web-push');

export function sendNotification(req, res) {
    const vapidKeys = {
        "publicKey":"BKo1_W92IjA6pXVy01PwK81nB6tD4BULnn2rMP2EbiiYDj1HUrQ7annNscCdxMPDp0-Wa9Naf5WnGcC_6x-H-mE",
        "privateKey":"LL3fFKUQeRri1Kaxr2aeGGTEhG2BkmotlMMn-aVuE8k"
    };
      
    webpush.setVapidDetails(
        'mailto:example@yourdomain.org',
        vapidKeys.publicKey,
        vapidKeys.privateKey
    );

  const allSubscriptions = JSON.parse(fs.readFileSync('./db.json', { encoding: 'utf8' })).subscriptions;

  console.log('Total subscriptions', allSubscriptions.length);

  const notificationPayload = {
      "notification": {
          "title": "Angular News",
          "body": "Newsletter Available!",
          "icon": "assets/main-page-logo-small-hat.png",
          "vibrate": [100, 50, 100],
          "data": {
              "dateOfArrival": Date.now(),
              "primaryKey": 1
          },
          "actions": [{
              "action": "explore",
              "title": "Go to the site"
          }]
      }
  };

  Promise.all(allSubscriptions.map(sub => webpush.sendNotification(
      sub, JSON.stringify(notificationPayload) )))
      .then(() => res.status(200).json({message: 'Newsletter sent successfully.'}))
      .catch(err => {
          console.error("Error sending notification, reason: ", err);
          res.sendStatus(500);
      });
}